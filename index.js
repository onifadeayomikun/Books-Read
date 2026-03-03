import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3002;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Livre",
  password: "mikun2005",
  port: 5432,
});
db.connect();

let books = [
    {
      id: 1,
      coverpage: "https://www.goodreads.com/book/show/18453291-how-successful-people-grow",
      title: "How successful people grow",
      content: "I was forced to read this book by my Dad, would definitely read it again. Growth is not accidental, you have to be intentional about it and in order to be successful, you have to grow. There are 15 key principles that facilates or creates success and this book would tell you all about that.",
      dates: "2022 T07:40:00Z",
      author: "John Maxwell",
      category: "Leadership",
      ratings: 10
   },
    {
      id: 2,
      coverpage: "https://www.goodreads.com/book/show/3228917-outliers",
      title: "Outliers",
      content: "The book after my heart. I loved reading because of this book. Tells you a lot about life especially how unfair, unbalanced and unequal it can be. The book tells that in order to be an outlier or a successful person you need some kind of luck. It might seem untrue but by the time you are done with the 321 pages of the book, you would come to terms with me.",
      dates: "2025-09-20T12:40:00Z",
      author: "Malcolm Gladwell",
      category: "Life",
      ratings: 10
   }
];   

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
   try {
    const result = await db.query("SELECT * FROM books ORDER BY id ASC");

    res.render("index.ejs", { 
      books: result.rows,  
    });
   } catch (err) {
    console.log(err);
  } 
});
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Book", submit: "Create Book" })
});

app.get("/post/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    const book = result.rows[0];
    res.render("modify.ejs", { 
      heading: "Edit Book",
      submit: "Update Book",
      book
    });
   } catch (error) {
    res.status(500).json({ message: "Error fetching Book" });
  }  
  });

app.get("/books/:category", async (req, res) => {
  try {
    const category = req.params.category;
    console.log(category);
    const result = await db.query("SELECT * FROM books WHERE category = $1", [category]);
    res.render("index.ejs", { 
      books: result.rows,  
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }

});  

app.post("/new", async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const author = req.body.author;
  const category = req.body.category;
  const ratings = req.body.ratings;
  const coverpage = req.body.coverpage;

  try {
    await db.query(
      "INSERT INTO books (title, content, author, category, ratings, coverpage) VALUES ($1, $2, $3, $4, $5, $6)",
       [title, content, author, category, ratings, coverpage]);
        res.redirect("/");
      } catch (error) {
    console.log(error);
  }
});
app.post("/post/:id", async (req, res) => {
try {
  const id = req.params.id;
  console.log(id);
  const existingBook = books.find((book) => book.id == id);
  const title = req.body.title || existingBook.title;
  const content = req.body.content || existingBook.content;
  const author = req.body.author || existingBook.author;
  const category = req.body.category || existingBook.category;
  const ratings = req.body.ratings || existingBook.ratings;
  const coverpage = req.body.coverpage || existingBook.coverpage; 

    await db.query(
      "UPDATE books SET title = ($1), content = ($2), author = ($3), category = ($4), ratings =  ($5), coverpage = ($6) WHERE id = $7",
       [title, content, author, category, ratings, coverpage, id]);
        res.redirect("/");
      } catch (error) {
        res.status(500).send("Server Error");
        console.log(error);
  }  
}); 

app.post("/delete/:id", async (req, res) => {
   const id = req.params.id;
   try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
   } catch (error) {
    console.log(error);
   }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});