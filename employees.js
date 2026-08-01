// Full staff list — edit here to add/remove employees
const EMPLOYEES = [
  "Helen P.",
  "Natsinee P.",
  "Pendo J.",
  "Sorina C.",
  "Sujith K.",
  "Edmund S.",
  "Natasha S.",
  "Sam N.",
  "Mary C.",
  "Sulfiker H.",
  "Santhi T.",
  "Chaithanya S.",
  "Melvin V.",
  "Sushmila R.",
  "Segui V.",
  "Rupinder K.",
  "Rishan R.",
  "Jobanjeet S.",
  "Dhanya S.",
  "Disha D.",
  "Princy A.",
  "Chris F.",
  "Nichola B.",
  "Prince M.",
  "Elaine M.",
  "Janet D.",
  "Jenny R.",
  "Iveta B.",
  "Cheryl R.",
  "Sarah K.",
  "Michelle B.",
  "Alyssa S.",
  "Jowanna K. (Night Nurse)",
  "Maulik S.",
  "Cook"
];

// Returns the live staff list. First time ever, it seeds localStorage
// with the EMPLOYEES array above. After that, add/remove from the
// Manager page is what changes this list.
function getEmployees() {
  const stored = localStorage.getItem("employees");
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem("employees", JSON.stringify(EMPLOYEES));
  return EMPLOYEES.slice();
}

function saveEmployees(list) {
  localStorage.setItem("employees", JSON.stringify(list));
}

function addEmployee(name) {
  name = name.trim();
  if (!name) return getEmployees();

  const list = getEmployees();
  const exists = list.some(function (n) {
    return n.toLowerCase() === name.toLowerCase();
  });

  if (!exists) {
    list.push(name);
    saveEmployees(list);
  }
  return list;
}

function removeEmployee(name) {
  const list = getEmployees().filter(function (n) {
    return n !== name;
  });
  saveEmployees(list);
  return list;
}
