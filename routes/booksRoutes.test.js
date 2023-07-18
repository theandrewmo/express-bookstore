const request = require("supertest");
const app = require('../app');
const db = require('../db');
const Book = require('../models/book');

describe("Books Routes Test", function() {

    const book1 = {
        isbn: "12345",
        amazon_url: "http://test_url",
        author: "Tester",
        language: "Testlang",
        pages: 200,
        publisher: "Testpub",
        title: "Testtitle",
        year: 2020
    }

    const book2 = {
        isbn: "678910",
        amazon_url: "http://test_url2",
        author: "Tester2",
        language: "Testlang2",
        pages: 300,
        publisher: "Testpub2",
        title: "Testtitle2",
        year: 2021
    }

    const badBook = {
        isbn: 333,
        amazon_url: '',
        language: 3,
        title: null
    }
    
    beforeEach(async function() {
        await db.query("DELETE FROM books");
        await Book.create(book1)
    })

    test("can get all books", async function() {
        const response = await request(app)
        .get('/books')
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            books: [book1]
        })
    })

    test("can find a book by isbn", async function() {
        const response = await request(app)
        .get('/books/12345')
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            book: book1
        })
    })

    test("will return error message when isbn not found", async function() {
        const response = await request(app)
        .get('/books/5')
        expect(response.statusCode).toBe(404);
    })

    test("can create a book", async function() {
        const response = await request(app)
            .post("/books")
            .send(book2)
        expect(response.statusCode).toBe(201)
        expect(response.body).toEqual({
            book: book2
        })
    })

    test("will not create a book when incorrect information is given", async function() {
        const response = await request(app)
        .post('/books')
        .send(badBook)
        expect(response.statusCode).toBe(400);
    })

    test("can update a book", async function() {
        const bookUpdate = {
            isbn: "12345",
            amazon_url: "http://updated",
            author: "Tester2updated",
            language: "Testlang2updated",
            pages: 3000,
            publisher: "Testpub2updated",
            title: "Testtitle2updated",
            year: 2022
        }
        const response = await request(app)
            .put("/books/12345")
            .send(bookUpdate)
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({
            book: bookUpdate
        })
    })

    test("will not update a book if bad information given", async function() {
        const response = await request(app)
            .put("/books/12345")
            .send(badBook)
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: { message: [
                "instance requires property \"author\"",
                "instance requires property \"pages\"",
                "instance requires property \"publisher\"",
                "instance requires property \"year\"",
                "instance.isbn is not of a type(s) string",
                "instance.language is not of a type(s) string",
                "instance.title is not of a type(s) string",
                ],
                status: 400},
                message : [
                 "instance requires property \"author\"",
                "instance requires property \"pages\"",
                "instance requires property \"publisher\"",
                "instance requires property \"year\"",
                "instance.isbn is not of a type(s) string",
                "instance.language is not of a type(s) string",
                "instance.title is not of a type(s) string",
                ]
        })
    })

    test("can delete a book", async function() {
        const response = await request(app)
            .delete("/books/12345")
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({
            message: "Book deleted"
        })
    })

    test("can return error when trying to delete a book that doesn't exist", async function() {
        const response = await request(app)
            .delete("/books/5")
        expect(response.statusCode).toBe(404)
        expect(response.body).toEqual({
            error : {
                message: `There is no book with an isbn '5'`,
                status: 404
            },
            message:`There is no book with an isbn '5'`
        })
    })    

    afterAll(async function() {
        await db.end();
    })
})