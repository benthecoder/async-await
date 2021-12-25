import fetch from "node-fetch";

// using then catch

const getUser1 = (user) => {
  fetch(`https://api.github.com/users/${user}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((e) => {
      console.error(e);
    });
};

// Using async await
const getUser2 = async (user) => {
  try {
    const response = await fetch(`https://api.github.com/users/${user}`);
    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.error(error);
  }
};

getUser1("benthecoder");
getUser2("benthecoder");
