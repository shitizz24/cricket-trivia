// Static list of well-known cricketers used as wrong-answer distractors
export const CRICKETERS = [
  "Virat Kohli",
  "Rohit Sharma",
  "MS Dhoni",
  "Sachin Tendulkar",
  "Steve Smith",
  "David Warner",
  "Pat Cummins",
  "Ben Stokes",
  "Joe Root",
  "Babar Azam",
  "Kane Williamson",
  "Rishabh Pant",
  "Jasprit Bumrah",
  "Ravindra Jadeja",
  "Shubman Gill",
  "KL Rahul",
  "Hardik Pandya",
  "Mitchell Starc",
  "Nathan Lyon",
  "Travis Head",
  "Marnus Labuschagne",
  "Jonny Bairstow",
  "Stuart Broad",
  "James Anderson",
  "Shakib Al Hasan",
  "Mushfiqur Rahim",
  "Tamim Iqbal",
  "Quinton de Kock",
  "Kagiso Rabada",
  "Temba Bavuma",
  "Dimuth Karunaratne",
  "Angelo Mathews",
  "Shaheen Afridi",
  "Mohammad Rizwan",
  "Fakhar Zaman",
  "Glenn Maxwell",
  "Adam Zampa",
  "Dawid Malan",
  "Trent Boult",
  "Tim Southee",
];

export function getDistractors(correctName: string, count = 3): string[] {
  const pool = CRICKETERS.filter(
    (name) => name.toLowerCase() !== correctName.toLowerCase()
  );
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
