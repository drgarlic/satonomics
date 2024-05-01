// Depreciated: 20 times slower with reverse sorted insert than btreemap/hashmap
// Would be of course better with binary search but don't think it's worth it

use std::{
    cmp::Ordering,
    fmt::Debug,
    ops::{Add, AddAssign, Deref, Sub, SubAssign},
};

use savefile_derive::Savefile;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq)]
enum Mutation<V> {
    Insert(V),
    Remove,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct SparsedVec<K, V>
where
    K: Into<usize>
        + From<usize>
        + Ord
        + Copy
        + Add<Output = K>
        + Sub<Output = K>
        + Default
        + AddAssign
        + SubAssign
        + savefile::Serialize
        + savefile::Deserialize,
    V: savefile::Serialize + savefile::Deserialize,
{
    last_index: Option<K>,
    holes: Vec<(K, K)>,
    values: Vec<V>,
}

impl<K, V> SparsedVec<K, V>
where
    K: Into<usize>
        + Debug
        + From<usize>
        + Ord
        + Copy
        + Clone
        + Add<Output = K>
        + Sub<Output = K>
        + Default
        + AddAssign
        + SubAssign
        + savefile::Serialize
        + savefile::Deserialize,
    V: PartialEq + savefile::Serialize + savefile::Deserialize + Debug + Copy + Clone + Default,
{
    pub fn get(&self, index: K) -> Option<&V> {
        self.get_real_index(index)
            .and_then(|index| self.values.get(index.into()))
    }

    pub fn get_mut(&mut self, index: K) -> Option<&mut V> {
        self.get_real_index(index)
            .and_then(|index| self.values.get_mut(index.into()))
    }

    fn get_real_index(&self, index: K) -> Option<K> {
        let values_len = self.values.len();

        if values_len == 0 || self.last_index.is_some_and(|last_index| last_index < index) {
            return None;
        }

        let holes_len = self.holes.len();

        if holes_len == 0 {
            return Some(index);
        }

        let mut offset = K::default();

        let one = K::from(1);

        for &(hole_index, hole_size) in self.holes.iter() {
            if hole_size == K::default() {
                panic!("Shouldn't ve an empty hole");
            }

            match hole_index.cmp(&index) {
                Ordering::Less => {
                    if hole_index + hole_size - one >= index {
                        return None;
                    }

                    offset += hole_size;
                }
                Ordering::Greater => break,
                Ordering::Equal => return None,
            }
        }

        Some(index - offset)
    }

    pub fn to_vec(&self) -> Vec<(usize, &V)> {
        let mut tuples = self.values.iter().enumerate().collect::<Vec<_>>();

        let mut offset: usize = 0;

        // TODO: Fix terrible double for_each
        self.holes.iter().for_each(|(hole_index, hole_size)| {
            let start = (*hole_index).into() - offset;
            tuples[start..].iter_mut().for_each(|tuple| {
                tuple.0 += (*hole_size).into();
            });

            offset += (*hole_size).into();
        });

        tuples
    }

    pub fn insert(&mut self, index: K, value: V) -> Option<V> {
        self.mutate(index, Mutation::Insert(value))
    }

    pub fn remove(&mut self, index: K) -> Option<V> {
        self.mutate(index, Mutation::Remove)
    }

    pub fn clear(&mut self) {
        self.values = vec![];
        self.holes = vec![];
        self.last_index = None;
    }

    fn mutate(&mut self, index: K, mutation: Mutation<V>) -> Option<V> {
        let one = K::from(1_usize);

        let mut real_index: usize = index.into();

        let mut hole_to_delete = None;
        let mut hole_to_insert = None;
        let mut hole_to_be_consumed = None;

        let mut extended_previous_hole = false;
        let mut extended_next_hole = false;
        let mut ends_in_hole = false;

        let mut processed_holes = 0;

        for (hole_index, (hole_start, hole_size)) in self.holes.iter_mut().enumerate() {
            let hole_end = *hole_start + *hole_size - one;

            match (*hole_start).cmp(&index) {
                // Requested index is after hole's start
                Ordering::Less => {
                    processed_holes += 1;

                    match hole_end.cmp(&index) {
                        // Hole is before requested index
                        Ordering::Less => {
                            // dbg!("< <");

                            real_index -= (*hole_size).into();

                            if mutation == Mutation::Remove && hole_end + one == index {
                                if real_index == self.values.len() - 1 {
                                    hole_to_delete.replace(hole_index);
                                } else {
                                    *hole_size += one;
                                    extended_previous_hole = true;
                                }
                            }
                        }
                        // Requested index is inside the hole
                        Ordering::Greater => {
                            // dbg!("< >");

                            ends_in_hole = true;

                            let previous_hole_size = *hole_size;

                            *hole_size = index - *hole_start;

                            real_index -= (*hole_size).into();

                            match mutation {
                                Mutation::Insert(_) => hole_to_insert.replace((
                                    hole_index + 1,
                                    (index + one, previous_hole_size - *hole_size - one),
                                )),
                                Mutation::Remove => return None,
                            };

                            break;
                        }
                        // Requested index is the end of the hole
                        Ordering::Equal => {
                            // dbg!("< ==");

                            ends_in_hole = true;

                            match mutation {
                                Mutation::Insert(_) => {
                                    *hole_size -= one;
                                    real_index -= (*hole_size).into();
                                }
                                Mutation::Remove => return None,
                            };

                            break;
                        }
                    }
                }
                // Requested index is before hole
                Ordering::Greater => {
                    // dbg!(">");

                    if mutation == Mutation::Remove
                        && *hole_start > K::default()
                        && *hole_start - one == index
                    {
                        extended_next_hole = true;

                        if extended_previous_hole {
                            hole_to_be_consumed.replace((hole_index, *hole_size));
                        } else {
                            *hole_start -= one;
                            *hole_size += one;
                        }
                    }

                    break;
                }
                // Requested index is start of hole
                Ordering::Equal => {
                    // dbg!("==")s;

                    ends_in_hole = true;

                    match mutation {
                        Mutation::Insert(_) => {
                            if *hole_size > one {
                                *hole_start += one;
                                *hole_size -= one;
                            } else {
                                hole_to_delete.replace(hole_index);
                            }
                        }
                        Mutation::Remove => return None,
                    };

                    break;
                }
            }
        }

        let mut deleted_hole_size = None;

        if let Some(hole_index_to_delete) = hole_to_delete {
            if hole_to_insert.is_some() || hole_to_be_consumed.is_some() {
                panic!("Shoudln't be possible");
            }

            deleted_hole_size.replace(
                self.holes
                    .splice(hole_index_to_delete..=hole_index_to_delete, [])
                    .next()
                    .unwrap()
                    .1,
            );
        } else if let Some((hole_index_to_insert, hole)) = hole_to_insert {
            if hole_to_be_consumed.is_some() {
                panic!("Shoudln't be possible");
            }

            match hole_index_to_insert.cmp(&self.holes.len()) {
                Ordering::Less | Ordering::Equal => self
                    .holes
                    .splice(hole_index_to_insert..hole_index_to_insert, [hole]),
                Ordering::Greater => panic!("Shouldn't be possible"),
            };
        } else if let Some((hole_index_to_consume, hole_size)) = hole_to_be_consumed {
            self.holes.get_mut(hole_index_to_consume - 1).unwrap().1 += hole_size;
            self.holes
                .splice(hole_index_to_consume..=hole_index_to_consume, []);
        }

        let len = self.values.len();

        match mutation {
            Mutation::Insert(value) => match real_index.cmp(&len) {
                Ordering::Less => {
                    if ends_in_hole {
                        self.values.push(value);
                        self.values[real_index..].rotate_right(1);
                        None
                        // self.values.splice(real_index..real_index, [value]).next()
                    } else {
                        let previous = Some(self.values[real_index]);
                        self.values[real_index] = value;
                        previous
                    }
                }
                ordering => {
                    self.last_index.replace(index);

                    self.values.push(value);

                    if ordering == Ordering::Greater {
                        let len = K::from(len);
                        let fixed_index = K::from(real_index);

                        self.holes
                            .push((len + index - fixed_index, fixed_index - len));
                    }

                    None
                }
            },
            Mutation::Remove => {
                if real_index < len {
                    let is_last = real_index == len - 1;

                    if is_last {
                        if len > 1 {
                            self.last_index.replace(
                                self.last_index.unwrap()
                                    - one
                                    - deleted_hole_size.unwrap_or_default(),
                            );
                        } else {
                            self.last_index.take();
                        }
                    }

                    let needs_new_hole = !is_last && !extended_previous_hole && !extended_next_hole;

                    if needs_new_hole {
                        self.holes
                            .splice(processed_holes..processed_holes, [(index, one)]);
                    }

                    self.values.splice(real_index..=real_index, []).next()
                } else {
                    None
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basics() {
        let mut v: SparsedVec<usize, usize> = SparsedVec::default();

        assert_eq!(
            v.insert(0, 0),
            None,
            "Inserting to empty index should return None"
        );

        assert_eq!(v.to_vec(), vec![(0, &0)]);
        assert_eq!(v.last_index, Some(0));
        assert_eq!(v.get(0), Some(&0));
        assert_eq!(v.get(100000000), None);

        assert_eq!(
            v.insert(0, 1),
            Some(0),
            "Inserting to occupied spot should replace previous value and return it"
        );
        assert_eq!(v.to_vec(), vec![(0, &1)]);
        assert_eq!(v.last_index, Some(0));

        assert_eq!(v.insert(1, 2), None);
        assert_eq!(v.insert(2, 3), None);

        assert_eq!(v.to_vec(), vec![(0, &1), (1, &2), (2, &3)]);
        assert_eq!(v.last_index, Some(2));

        assert_eq!(v.get(1), Some(&2));

        assert_eq!(v.remove(1), Some(2));
        assert_eq!(v.to_vec(), vec![(0, &1), (2, &3)]);
        assert_eq!(v.holes, vec![(1, 1)]);
        assert_eq!(v.values, vec![1, 3]);
        assert_eq!(v.last_index, Some(2));

        assert_eq!(v.insert(6, 4), None);
        assert_eq!(v.get(5), None);
        assert_eq!(v.get(6), Some(&4));
        assert_eq!(v.get(7), None);

        assert_eq!(v.to_vec(), vec![(0, &1), (2, &3), (6, &4)]);
        assert_eq!(
            v.holes,
            vec![(1, 1), (3, 3)],
            "Adding value far away should create a hole at the end"
        );
        assert_eq!(v.values, vec![1, 3, 4]);
        assert_eq!(v.last_index, Some(6));

        assert_eq!(v.insert(6, 5), Some(4));
        assert_eq!(v.to_vec(), vec![(0, &1), (2, &3), (6, &5)]);
        assert_eq!(v.last_index, Some(6));

        assert_eq!(v.insert(7, 6), None);
        assert_eq!(v.insert(8, 7), None);
        assert_eq!(v.insert(5, 8), None);

        assert_eq!(
            v.to_vec(),
            vec![(0, &1), (2, &3), (5, &8), (6, &5), (7, &6), (8, &7)]
        );
        assert_eq!(
            v.holes,
            vec![(1, 1), (3, 2)],
            "Should've shrunk the last hole at the end"
        );
        assert_eq!(v.get(0), Some(&1));
        assert_eq!(v.get(1), None);
        assert_eq!(v.get(2), Some(&3));
        assert_eq!(v.get(3), None);
        assert_eq!(v.get(4), None);
        assert_eq!(v.get(5), Some(&8));
        assert_eq!(v.get(6), Some(&5));
        assert_eq!(v.get(7), Some(&6));
        assert_eq!(v.get(8), Some(&7));
        assert_eq!(v.values, vec![1, 3, 8, 5, 6, 7]);
        assert_eq!(v.last_index, Some(8));

        assert_eq!(v.insert(1, 9), None);

        assert_eq!(
            v.to_vec(),
            vec![
                (0, &1),
                (1, &9),
                (2, &3),
                (5, &8),
                (6, &5),
                (7, &6),
                (8, &7)
            ]
        );
        assert_eq!(v.holes, vec![(3, 2)], "Should've remove the first hole");
        assert_eq!(v.values, vec![1, 9, 3, 8, 5, 6, 7]);
        assert_eq!(v.last_index, Some(8));

        assert_eq!(v.remove(2), Some(3));
        assert_eq!(
            v.holes,
            vec![(2, 3)],
            "Should expanded by one on the left side"
        );
        assert_eq!(v.last_index, Some(8));

        assert_eq!(v.remove(5), Some(8));
        assert_eq!(
            v.holes,
            vec![(2, 4)],
            "Should expanded by one on the right side"
        );
        assert_eq!(v.last_index, Some(8));

        assert_eq!(v.remove(0), Some(1));
        assert_eq!(v.holes, vec![(0, 1), (2, 4)], "Should've added a new hole");
        assert_eq!(v.last_index, Some(8));

        assert_eq!(v.remove(1), Some(9));
        assert_eq!(v.to_vec(), vec![(6, &5), (7, &6), (8, &7)]);
        assert_eq!(v.holes, vec![(0, 6)], "Should've merged the two holes");
        assert_eq!(v.values, vec![5, 6, 7]);
        assert_eq!(v.last_index, Some(8));

        assert_eq!(v.insert(0, 10), None);
        assert_eq!(v.remove(8), Some(7));
        assert_eq!(v.remove(0), Some(10));
        assert_eq!(v.to_vec(), vec![(6, &5), (7, &6)]);
        assert_eq!(v.holes, vec![(0, 6)]);
        assert_eq!(v.values, vec![5, 6]);
        assert_eq!(v.last_index, Some(7));

        assert_eq!(v.remove(7), Some(6));
        assert_eq!(v.remove(6), Some(5));
        assert_eq!(v.to_vec(), vec![]);
        assert_eq!(v.holes, vec![]);
        assert_eq!(v.values, vec![] as Vec<usize>);
        assert_eq!(v.last_index, None);

        assert_eq!(v.insert(2, 3), None);
        assert_eq!(v.to_vec(), vec![(2, &3)]);
        assert_eq!(v.holes, vec![(0, 2)]);
        assert_eq!(v.values, vec![3]);
        assert_eq!(v.last_index, Some(2));

        assert_eq!(v.insert(0, 1), None);
        assert_eq!(v.insert(1, 2), None);
        assert_eq!(v.to_vec(), vec![(0, &1), (1, &2), (2, &3)]);
        assert_eq!(v.holes, vec![]);
        assert_eq!(v.values, vec![1, 2, 3]);
        assert_eq!(v.last_index, Some(2));

        assert_eq!(v.insert(10, 4), None);
        assert_eq!(v.to_vec(), vec![(0, &1), (1, &2), (2, &3), (10, &4)]);
        assert_eq!(v.holes, vec![(3, 7)]);
        assert_eq!(v.values, vec![1, 2, 3, 4]);
        assert_eq!(v.last_index, Some(10));

        assert_eq!(v.insert(20, 5), None);
        assert_eq!(
            v.to_vec(),
            vec![(0, &1), (1, &2), (2, &3), (10, &4), (20, &5)]
        );
        assert_eq!(v.holes, vec![(3, 7), (11, 9)]);
        assert_eq!(v.values, vec![1, 2, 3, 4, 5]);
        assert_eq!(v.last_index, Some(20));

        dbg!(v.insert(17, 6));
        assert_eq!(
            v.to_vec(),
            vec![(0, &1), (1, &2), (2, &3), (10, &4), (17, &6), (20, &5)]
        );
        assert_eq!(v.holes, vec![(3, 7), (11, 6), (18, 2)]);
        assert_eq!(v.values, vec![1, 2, 3, 4, 6, 5]);
        assert_eq!(v.last_index, Some(20));

        assert_eq!(v.insert(18, 7), None);
        assert_eq!(v.get(18), Some(&7));
        assert_eq!(
            v.to_vec(),
            vec![
                (0, &1),
                (1, &2),
                (2, &3),
                (10, &4),
                (17, &6),
                (18, &7),
                (20, &5)
            ]
        );
        assert_eq!(v.holes, vec![(3, 7), (11, 6), (19, 1)]);
        assert_eq!(v.values, vec![1, 2, 3, 4, 6, 7, 5]);
        assert_eq!(v.last_index, Some(20));

        assert_eq!(v.remove(17), Some(6));
        assert_eq!(v.get(17), None);
        assert_eq!(
            v.to_vec(),
            vec![(0, &1), (1, &2), (2, &3), (10, &4), (18, &7), (20, &5)]
        );
        assert_eq!(v.holes, vec![(3, 7), (11, 7), (19, 1)]);
        assert_eq!(v.values, vec![1, 2, 3, 4, 7, 5]);
        assert_eq!(v.last_index, Some(20));

        assert_eq!(v.insert(17, 6), None);
        assert_eq!(v.get(17), Some(&6));
        assert_eq!(
            v.to_vec(),
            vec![
                (0, &1),
                (1, &2),
                (2, &3),
                (10, &4),
                (17, &6),
                (18, &7),
                (20, &5)
            ]
        );
        assert_eq!(v.holes, vec![(3, 7), (11, 6), (19, 1)]);
        assert_eq!(v.values, vec![1, 2, 3, 4, 6, 7, 5]);
        assert_eq!(v.last_index, Some(20));

        assert_eq!(v.remove(20), Some(5));
        assert_eq!(
            v.to_vec(),
            vec![(0, &1), (1, &2), (2, &3), (10, &4), (17, &6), (18, &7)]
        );
        assert_eq!(v.holes, vec![(3, 7), (11, 6)]);
        assert_eq!(v.values, vec![1, 2, 3, 4, 6, 7]);
        assert_eq!(v.last_index, Some(18));

        assert_eq!(v.insert(100, 100), None);
        assert_eq!(
            v.to_vec(),
            vec![
                (0, &1),
                (1, &2),
                (2, &3),
                (10, &4),
                (17, &6),
                (18, &7),
                (100, &100)
            ]
        );
        assert_eq!(v.holes, vec![(3, 7), (11, 6), (19, 81)]);
        assert_eq!(v.values, vec![1, 2, 3, 4, 6, 7, 100]);
        assert_eq!(v.last_index, Some(100));

        assert_eq!(v.insert(50, 50), None);
        assert_eq!(
            v.to_vec(),
            vec![
                (0, &1),
                (1, &2),
                (2, &3),
                (10, &4),
                (17, &6),
                (18, &7),
                (50, &50),
                (100, &100)
            ]
        );
        assert_eq!(v.holes, vec![(3, 7), (11, 6), (19, 31), (51, 49)]);
        assert_eq!(v.values, vec![1, 2, 3, 4, 6, 7, 50, 100]);

        assert_eq!(v.get(49), None);
        assert_eq!(v.get(50), Some(&50));
        assert_eq!(v.get(51), None);
    }
}
