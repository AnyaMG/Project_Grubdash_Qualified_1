const path = require("path");

const dishes = require(path.resolve("src/data/dishes-data"));


const nextId = require("../utils/nextId");


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
