/* 
 * Web Engineering WS 20/21
 * Semsterprojekt SPA "Blogger"
 * Gruppe 12
 * Simon Nunez Aschenbrenner (908606)
 * 
 * Adaptiert von Prof. Dr. Simone Strippgen
 */

"use strict";

const model = (function () {

    // Private Variablen
    let loggedIn = false;
    let pathGetBlogs = 'blogger/v3/users/self/blogs';
    let pathBlogs = 'blogger/v3/blogs';
    
    // Private Funktionen

    // Formatiert den Datum-String in date in zwei mögliche Datum-Strings:
    // long = true: Mittwoch, 24. Oktober 2018, 12:21
    // long = false: 24.10.2018
    function formatDate(dateString, long) {

        let date = new Date (dateString.slice(0, -6));
        let longForm = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
        let shortForm = {day: '2-digit', month: '2-digit', year: 'numeric'};
        if (long) {
            return date.toLocaleDateString('de-DE', longForm);
        } else {
            return date.toLocaleDateString('de-DE', shortForm);
        }
    }
    
    // Konstruktoren für Daten-Objekte

    function Blog(bid, name, url, postCount, publishedDate, updatedDate) {
        this.bid = bid;
        this.name = name;
        this.url = url;
        this.postCount = postCount;
        this.publishedDate = publishedDate;
        this.updatedDate = updatedDate;
    }
    Blog.prototype = {
        constructor: Blog,
        setFormatDates: function (long) {
            this.published = formatDate(this.publishedDate, long);
            this.updated = formatDate(this.updatedDate, long);
        }
    }

    function Post(pid, bid, title, commentCount, publishedDate, updatedDate, content) {
        this.pid = pid;
        this.bid = bid;
        this.title = title;
        this.commentCount = commentCount;
        this.publishedDate = publishedDate;
        this.updatedDate = updatedDate;
        this.content = content;
    }
    Post.prototype = {
        constructor: Post,
        setFormatDates: function (long) {
            this.published = formatDate(this.publishedDate, long);
            this.updated = formatDate(this.updatedDate, long);
        }
    }

    function Comment(cid, pid, bid, author, publishedDate, updatedDate, content) {
        this.cid = cid;
        this.pid = pid;
        this.bid = bid;
        this.author = author;
        this.publishedDate = publishedDate;
        this.updatedDate = updatedDate;
        this.content = content;
    }
    Comment.prototype = {
        constructor: Comment,
        setFormatDates: function (long) {
            this.published = formatDate(this.publishedDate, long);
            this.updated = formatDate(this.updatedDate, long);
        }
    }

    // Oeffentliche Methoden

    return {

        // Setter für loggedIn
        setLoggedIn(b){
            console.log(`model.setLoggedIn(${b})`);
            loggedIn = b;
        },

        // Getter für loggedIn
        isLoggedIn(){
            return loggedIn;
        },

        // Liefert den angemeldeten Nutzer mit allen Infos
        getSelf(callback) {
            console.log("model.getSelf()");
            var request = gapi.client.request({
                'method': 'GET',
                'path': 'blogger/v3/users/self'
            });

            request.execute((result) => {
                callback(result);
            });
        },

        // Liefert alle Blogs des angemeldeten Nutzers
        getAllBlogs(callback) {
            console.log("model.getAllBlogs()");
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathGetBlogs
            });

            request.execute((result) => {
                let resultArray = [];
                if (result.items) {
                    for (let blog of result.items) {
                        resultArray.push(new Blog(blog.id, blog.name, blog.url, blog.posts.totalItems, blog.published, blog.updated))
                    }
                }
                callback(resultArray);
            });
        },

        // Liefert den Blog mit der Blog-Id bid
        getBlog(bid, callback) {
            console.log(`model.getBlog(${bid})`);
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid
            });

            request.execute((blog) => {
                callback(new Blog(blog.id, blog.name, blog.url, blog.posts.totalItems, blog.published, blog.updated));
            });
        },

        // Liefert alle Posts zu der  Blog-Id bid
        getAllPostsOfBlog(bid, callback) {
            console.log(`model.getAllPostsOfBlog(${bid})`);
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts'
            });

            request.execute((result) => {
                let resultArray = [];
                if (result.items) {
                    for (let post of result.items) {
                        resultArray.push(new Post(post.id, post.blog.id, post.title, post.replies.totalItems, post.published, post.updated, post.content))
                    }
                }
                callback(resultArray);
            });
        },

        // Liefert den Post mit der Post-Id pid im Blog mit der Blog-Id bid
        getPost(bid, pid, callback) {
            console.log(`model.getPost(${bid}, ${pid})`);
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid
            });

            request.execute((post) => {
                callback(new Post(post.id, post.blog.id, post.title, post.replies.totalItems, post.published, post.updated, post.content));
            });
        },

        // Liefert alle Kommentare zu dem Post mit der Post-Id pid im Blog mit der Blog-Id bid
        getAllCommentsOfPost(bid, pid, callback) {
            console.log(`model.getAllCommentsOfPost(${bid}, ${pid})`);
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid + "/comments"
            });

            request.execute((result) => {
                let resultArray = [];
                if (result.items) {
                    for (let comment of result.items) {
                        resultArray.push(new Comment(comment.id, comment.post.id, comment.blog.id, comment.author.displayName, comment.published, comment.updated, comment.content))
                    }
                }
                callback(resultArray);
            });
        },

        // Löscht den Kommentar mit der Id cid zu Post mit der Post-Id pid im Blog mit der Blog-Id bid, Callback wird ohne result aufgerufen
        deleteComment(bid, pid, cid, callback) {

            var path = pathBlogs + "/" + bid + '/posts/' + pid + "/comments/" + cid;
            console.log(`model.deleteComment(${bid}, ${pid}, ${cid})`);
            var request = gapi.client.request({
                'method': 'DELETE',
                'path': path
            });

            request.execute(callback);
        },

        // Fügt dem Blog mit der Blog-Id bid einen neuen Post mit title und content hinzu, Callback wird mit neuem Post aufgerufen
        addNewPost(bid, title, content, callback) {

            var body = {
                kind: "blogger#post",
                title: title,
                blog: {
                    id: bid
                },
                content: content
            };

            console.log(`model.addNewPost(${bid}, "${title}")`);

            var request = gapi.client.request({
                'method': 'POST',
                'path': pathBlogs + "/" + bid + '/posts',
                'body': body
            });

            request.execute((post) => {
                callback(new Post(post.id, post.blog.id, post.title, post.replies.totalItems, post.published, post.updated, post.content));
            });
        },

        // Aktualisiert title und content im geänderten Post mit der Post-Id pid im Blog mit der Blog-Id bid
        updatePost(bid, pid, title, content, callback) {

            var body = {
                kind: "blogger#post",
                title: title,
                id: pid,
                blog: {
                    id: bid
                },
                content: content
            };

            console.log(`model.updatePost(${bid}, ${pid}, "${title}")`);

            var request = gapi.client.request({
                'method': 'PUT',
                'path': pathBlogs + "/" + bid + '/posts/' + pid,
                'body': body
            });

            request.execute((post) => {
                callback(new Post(post.id, post.blog.id, post.title, post.replies.totalItems, post.published, post.updated, post.content));
            });
        },

        // Löscht den Post mit der Post-Id pid im Blog mit der Blog-Id bid, Callback wird ohne result aufgerufen
        deletePost(bid, pid, callback) {
            
            var path = pathBlogs + "/" + bid + '/posts/' + pid;
            console.log(`model.deletePost(${bid}, ${pid})`);
            var request = gapi.client.request({
                'method': 'DELETE',
                'path': path
            });

            request.execute(callback);
        }
    };
})();
