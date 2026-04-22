
const FIRST_NAMES = [
  "Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry", "Lucas", "Benjamin", "Theodore",
  "Mateo", "Levi", "Sebastian", "Daniel", "Jack", "Michael", "Alexander", "Owen", "Asher", "Samuel",
  "Ethan", "Leo", "Jackson", "Mason", "Ezra", "John", "Hudson", "Luca", "Aiden", "Joseph",
  "David", "Jacob", "Logan", "Luke", "Julian", "Gabriel", "Grayson", "Isaac", "Anthony", "Wyatt",
  "Jayden", "Thomas", "Josiah", "Charles", "Christopher", "Miles", "Caleb", "Isaiah", "Andrew", "Matthew"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzales", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
];

export const generateRandomName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};
