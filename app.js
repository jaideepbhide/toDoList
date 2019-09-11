//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _= require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jaideep:<PASSWORD>@cluster0-6tuzr.mongodb.net/todolistDB", {useNewUrlParser:true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);
const item1  = new Item({
  name:"Study at home "
});
const item2  = new Item({
  name:"Study at college "
});

const item3  = new Item({
  name:"Study"
});

const defaultItems = [item1,item2,item3];

const listSchema ={
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err,result){
      if(result.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Success");
          }
        });
        res.redirect("/");
      }else{res.render("list", {listTitle: "Today", newListItems: result});}

  });

});
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){

    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete",function(req,res){
  const id = req.body.checkBox;
  const listName = req.body.listName;

  if(listName ==="Today"){
    Item.findByIdAndRemove(id,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Delete Success");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
