const fs = require('fs');
const path = require('path');
const testAssetsPath = path.join(__dirname, '../../../test-assets/');

// eslint-disable-next-line spellcheck/spell-checker
// contains "Congrations, you found the Easter Egg."
const fakeData =
  'JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0NF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDg0ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDUgODAgVGQKICAgIChDb25ncmF0aW9ucywgeW91IGZvdW5kIHRoZSBFYXN0ZXIgRWdnLikgVGoKICBFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA3NyAwMDAwMCBuIAowMDAwMDAwMTc4IDAwMDAwIG4gCjAwMDAwMDA0NTcgMDAwMDAgbiAKdHJhaWxlcgogIDw8ICAvUm9vdCAxIDAgUgogICAgICAvU2l6ZSA1CiAgPj4Kc3RhcnR4cmVmCjU2NQolJUVPRgo=';
// eslint-disable-next-line spellcheck/spell-checker
// contains "Congrations again"
const fakeData1 =
  'JVBERi0xLjEKICAgICXCpcKxw6sKICAgIAogICAgMSAwIG9iagogICAgICA8PCAvVHlwZSAvQ2F0YWxvZwogICAgICAgICAvUGFnZXMgMiAwIFIKICAgICAgPj4KICAgIGVuZG9iagogICAgCiAgICAyIDAgb2JqCiAgICAgIDw8IC9UeXBlIC9QYWdlcwogICAgICAgICAvS2lkcyBbMyAwIFJdCiAgICAgICAgIC9Db3VudCAxCiAgICAgICAgIC9NZWRpYUJveCBbMCAwIDMwMCAxNDRdCiAgICAgID4+CiAgICBlbmRvYmoKICAgIAogICAgMyAwIG9iagogICAgICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgICAgIC9QYXJlbnQgMiAwIFIKICAgICAgICAgIC9SZXNvdXJjZXMKICAgICAgICAgICA8PCAvRm9udAogICAgICAgICAgICAgICA8PCAvRjEKICAgICAgICAgICAgICAgICAgIDw8IC9UeXBlIC9Gb250CiAgICAgICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgICAgIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KICAgICAgICAgICAgICAgICAgID4+CiAgICAgICAgICAgICAgID4+CiAgICAgICAgICAgPj4KICAgICAgICAgIC9Db250ZW50cyA0IDAgUgogICAgICA+PgogICAgZW5kb2JqCiAgICAKICAgIDQgMCBvYmoKICAgICAgPDwgL0xlbmd0aCA4NCA+PgogICAgc3RyZWFtCiAgICAgIEJUCiAgICAgICAgL0YxIDE4IFRmCiAgICAgICAgNSA4MCBUZAogICAgICAgIChDb25ncmF0aW9ucyBhZ2FpbikgVGoKICAgICAgRVQKICAgIGVuZHN0cmVhbQogICAgZW5kb2JqCiAgICAKICAgIHhyZWYKICAgIDAgNQogICAgMDAwMDAwMDAwMCA2NTUzNSBmIAogICAgMDAwMDAwMDAxOCAwMDAwMCBuIAogICAgMDAwMDAwMDA3NyAwMDAwMCBuIAogICAgMDAwMDAwMDE3OCAwMDAwMCBuIAogICAgMDAwMDAwMDQ1NyAwMDAwMCBuIAogICAgdHJhaWxlcgogICAgICA8PCAgL1Jvb3QgMSAwIFIKICAgICAgICAgIC9TaXplIDUKICAgICAgPj4KICAgIHN0YXJ0eHJlZgogICAgNTY1CiAgICAlJUVPRg==';

const getFakeFile = (returnArray = false, useFakeData1 = false) => {
  const fakeFile = Buffer.from(
    useFakeData1 === true ? fakeData1 : fakeData,
    'base64',
  );
  fakeFile.name = 'fakeFile.pdf';
  fakeFile.size = fakeFile.length;

  if (returnArray) {
    return new Uint8Array(fakeFile);
  }

  return fakeFile;
};

const testInvalidPdfDocBytes = () => {
  return new Uint8Array(fs.readFileSync(`${testAssetsPath}not-a-pdf.pdf`));
};
const testInvalidPdfDoc = testInvalidPdfDocBytes();

const testPdfDocBytes = () => {
  // sample.pdf is a 1 page document
  return new Uint8Array(fs.readFileSync(testAssetsPath + 'sample.pdf'));
};
const testPdfDoc = testPdfDocBytes();

module.exports = {
  fakeData,
  getFakeFile,
  testInvalidPdfDoc,
  testPdfDoc,
};