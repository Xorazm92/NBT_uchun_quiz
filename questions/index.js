const industrialGroup1 = require('./industrial_group1.json');
const industrialGroup2 = require('./industrial_group2.json');
const industrialGroup3 = require('./industrial_group3.json');
const industrialGroup4 = require('./industrial_group4.json');
const safetyGroup1 = require('./safety_group1.json');
const safetyGroup2 = require('./safety_group2.json');
const safetyGroup3 = require('./safety_group3.json');
const safetyGroup4 = require('./safety_group4.json');

module.exports = {
  ...industrialGroup1,
  ...industrialGroup2,
  ...industrialGroup3,
  ...industrialGroup4,
  ...safetyGroup1,
  ...safetyGroup2,
  ...safetyGroup3,
  ...safetyGroup4,
};
