// Full staff list — edit here to add/remove employees
const EMPLOYEES = [
  "Anna T.",
  "Ravi P.",
  "Louise M.",
  "Codrin C.",
  "Farhan K.",
  "Oliver S.",
  "Beatrice S.",
  "Tom N.",
  "Karen C.",
  "Marcus H.",
  "Priya T.",
  "Devika S.",
  "Nathan V.",
  "Anitha R.",
  "Bruno V.",
  "Harpreet K.",
  "Aidan R.",
  "Gurpreet S.",
  "Meera S.",
  "Fatima D.",
  "Lucy A.",
  "Daniel F.",
  "Rebecca B.",
  "Marcus M.",
  "Olivia M.",
  "Susan D.",
  "Rachel R.",
  "Maria B.",
  "Karen R.",
  "Emma K.",
  "Hannah B.",
  "Melissa S.",
  "Jasmine K. (Night Nurse)",
  "Nikhil S.",
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
