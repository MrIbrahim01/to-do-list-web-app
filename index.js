import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import lodash from "lodash";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

// const items = ["eat", "sleep", "code"];
// const workItems = [];
mongoose.connect("mongodb+srv://admin-ibrahim:test123@cluster0.mp4tud6.mongodb.net/todolistDB");

const itemsSchema = {
    name : String
}
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist! "
});
const item2 = new Item({
    name:"Hit the + button to add a new item."
});
const item3 = new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items : [itemsSchema]
}

const List = mongoose.model("list", listSchema);

app.get("/", (req,res)=>{
    // const day = date.getDate()
Item.find()
.then((foundItems)=>{
    if (foundItems.length === 0 ){

        Item.insertMany(defaultItems)
        .then(console.log("Successfully Added default items"))
        .catch((err)=>{
            console.log(err);
        });

        res.redirect("/");
    } else {
        res.render("index.ejs", {listTitle: "Today", newItems:foundItems})
    }
})
.catch((err)=>{
    console.log(err);
})

app.get("/:listName", (req,res)=>{
    const customListName = lodash.capitalize(req.params.listName);
    List.findOne({name:customListName})
    .then((foundLists)=>{
        if(!foundLists){
            //Create a new list
            const list = new List({
                name: customListName,
                items:defaultItems
            })
            list.save();
            res.redirect("/" + customListName)
        } else{
            // Show existing list
            res.render("index.ejs",{listTitle: foundLists.name, newItems:foundLists.items} )
        }
    })
    .catch((err)=>{
        console.log(err);
    })
    
    
})
})
app.post("/", (req,res)=>{

    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    })
if(listName === "Today"){
    item.save();
    res.redirect("/")
} else {
    List.findOne({name :listName})
    .then((foundList)=>{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    })
}

})
app.post("/delete", (req, res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then(res.redirect("/"))
        .catch((err)=>{
            console.log(err);
        })

    } else {
       List.findOneAndUpdate({name : listName}, {$pull: {items : {_id:checkedItemId}}})
       .then(res.redirect("/" + listName))
       .catch((err)=>{
        console.log(err);
       })
    }
  })



app.listen(port, () => {
    console.log(`Server is running at port ${port}.`)
});
