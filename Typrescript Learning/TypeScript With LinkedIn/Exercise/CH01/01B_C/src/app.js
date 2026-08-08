/**
 * 
 * @param {number} contactId 
 * @returns 
 */
// we can add types to the JavaScript code using the JsDoc syntax from where the js will able to give those error!!
async function getContact(contactId) {
    const resp = await $.ajax({
      url: `/contacts/${contactId}`,
      dataType: "json",
    });
  
    // here ts is not able to understand that what is jquery
    return {
      id: +resp.id,
      name: resp.name,
      birthDate: new Date(resp.birthDate),
    };
    // here we are assigning the id a number and name a string and brithDate to date, Now problem is that we are reassigining them by string.
  }
  
  getContact(1).then((contact) => {
    contact.id = 1234
    contact.birthDate = new Date(12/12/1990);
    // if we fix here it will be done!
  });
  
  getContact(2).then((contact) => {
    console.log("Contact: ", JSON.stringify(contact));
  });