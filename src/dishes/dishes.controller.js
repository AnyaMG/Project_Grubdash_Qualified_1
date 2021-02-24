// const express = require("express");
// const app = express();

const path = require("path");
// app.use(express.json());

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
  res.json({ data: dishes });
}

function isValidDish(req, res, next) {
  const { data: { description, image_url, name, price } = {} } = req.body;

  if (!name || name === "") {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  if (!description) {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  if (!price || price === "" || price <= 0 || typeof(price) !== "number") {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  if (!image_url) {
    return next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }
  //code for is not a number, why no work?
  next();
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    return next();
  } else {
    return next({
      status: 404,
    });
  }
}

function dishIdValid(req, res, next) {
  const dishId = req.params.dishId;
  const { data: { description, image_url, name, price, id } = {} } = req.body;

  if (!dishId) {
      //why does this not work?
    return next({
      status: 404,
      message: `Dish does not exist ${dishId}`,
    });
  }
  if (id) {
    if (dishId !== id) {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
  }

  next();
}

function create(req, res, next) {
    //why does this not work?
  const { data: { description, image_url, name, price } = {} } = req.body;

  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  res.json({ data: foundDish });
}

function update(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const originalResult = foundDish;

  const {data: {id, name, description, image_url, price} = {} } = req.body
foundDish.id = id
foundDish.name = name
foundDish.description = description
foundDish.image_url = image_url
foundDish.price = price


  res.json({ data: foundDish });
}

function destroy(req,res,next){
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      return next({
        status: 405
      });
    } else {
      return next({
        status: 405,
      });
    }

}


module.exports = {
  list,
  create: [isValidDish, create],
  read: [dishExists, read],
  update: [dishExists, dishIdValid, isValidDish, update],
  delete:[destroy]
};
