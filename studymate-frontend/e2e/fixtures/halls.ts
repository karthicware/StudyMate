/**
 * Test Study Hall Fixtures
 * Predefined test study halls that match the seeded data in the test database
 */

export interface TestHall {
  id: number;
  ownerId: number;
  hallName: string;
  seatCount: number;
  address: string;
}

/**
 * Test study halls seeded in the test database
 */
export const TEST_HALLS = {
  downtown: {
    id: 1,
    ownerId: 1, // test.owner@studymate.test
    hallName: 'Test Study Hall Downtown',
    seatCount: 50,
    address: '123 Main Street, Downtown, Test City, TC 12345',
  },
  uptown: {
    id: 2,
    ownerId: 1, // test.owner@studymate.test
    hallName: 'Test Study Hall Uptown',
    seatCount: 30,
    address: '456 North Avenue, Uptown, Test City, TC 67890',
  },
  eastside: {
    id: 3,
    ownerId: 3, // test.owner2@studymate.test
    hallName: 'Second Owner Study Hall',
    seatCount: 40,
    address: '789 East Boulevard, Eastside, Test City, TC 11111',
  },
};
