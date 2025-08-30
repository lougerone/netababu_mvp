import type { Politician } from '@/components/CardPolitician';
import type { Party } from '@/components/CardParty';

export const politicians: Politician[] = [
  {
    id: 'p1',
    slug: 'narendra-modi',
    name: 'Narendra Modi',
    party: 'BJP',
    state: 'Gujarat',
    current_position: 'Prime Minister of India'
  },
  {
    id: 'p2',
    slug: 'rahul-gandhi',
    name: 'Rahul Gandhi',
    party: 'INC',
    state: 'Kerala',
    current_position: 'Member of Parliament'
  },
  {
    id: 'p3',
    slug: 'arvind-kejriwal',
    name: 'Arvind Kejriwal',
    party: 'AAP',
    state: 'Delhi',
    current_position: 'Chief Minister of Delhi'
  }
];

export const parties: Party[] = [
  { id: 'pt1', slug: 'bjp', name: 'Bharatiya Janata Party', abbrev: 'BJP', status: 'Active' },
  { id: 'pt2', slug: 'inc', name: 'Indian National Congress', abbrev: 'INC', status: 'Active' },
  { id: 'pt3', slug: 'aap', name: 'Aam Aadmi Party', abbrev: 'AAP', status: 'Active' }
];
