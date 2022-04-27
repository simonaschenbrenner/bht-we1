/* 
 * Web Engineering WS 20/21
 * Semsterprojekt SPA "Blogger"
 * Gruppe 12
 * Simon Nunez Aschenbrenner (908606)
 */

"use strict";

const userView = {

    render(data) {
        console.log("userView.render(): " + data);

        // Klonen Template-Knotens
        let user = document.getElementById("user").cloneNode(true);
        user.removeAttribute("id");

        // Einsetzen der Daten
        if (data) {
            helper.setDataInfo(user, {owner: data});
        // Wenn bei Blogger noch kein Anzeigename angegeben wurde
        } else {
            helper.setDataInfo(user, {owner: "Unbekannte*r Nutzer*in:<br><a href='https://www.blogger.com' target='_blank'>Bitte zunächst bei Blogger registrieren</a>"});
        }

        return user;
    }
};

const blogNavigationView = {

    render(data) {
        console.log("blogNavigationView.render()");

        // Klonen Template-Knotens
        let nav = document.getElementById("blog-nav").cloneNode(true);
        nav.removeAttribute("id");
        let ul = nav.querySelector("ul");

        // Template für Listenelemente erstellen und aus HTML entfernen
        let liTempl = ul.firstElementChild;
        liTempl.remove();

        // Erstellen eines Listenelements für jeden Blog
        for (let blog of data) {
            // Klonen des Template-Knotens für das Listenelement
            let li = liTempl.cloneNode(true);
            // Wenn es nur einen Post gibt, ändern von Plural zu Singular
            if (blog.postCount == 1) {
                let string = li.querySelector("a").innerHTML.slice(0, -2) + ")";
                li.querySelector("a").innerHTML = string;
            }
            // Einhängen in ul
            ul.appendChild(li);
            helper.setDataInfo(ul, blog);
        }
        return nav;
    }
};

const noBlogView = {
    
    render() {
        console.log("noBlogView.render()");

        let hint = document.getElementById("blog-nav").cloneNode(true);
        hint.removeAttribute("id");
        hint.querySelector("h1").innerHTML = "(NOCH) KEINE BLOX";
        hint.querySelector("li").innerHTML = "<a href='https://www.blogger.com' target='_blank'>Auf Blogger einen Blog erstellen</a>";

        return hint;
    }
};

const currentBlogView = {

    render(data) {
        console.log("currentBlogView.render()");

        // Klonen des Template-Knotens
        let currentBlog = document.getElementById("current-blog").cloneNode(true);
        currentBlog.removeAttribute("id");
        data.setFormatDates(true);
        
        // Wenn es nur einen Post gibt, ändern von Plural zu Singular
        if (data.postCount == 1) {
            currentBlog.querySelector(".post-count").innerHTML = "1 Post";
        }
        // Einsetzen der Daten
        helper.setDataInfo(currentBlog, data);

        return currentBlog;
    }

};

const blogSummaryView = {

    render(data, blogId) {
        console.log("blogSummaryView.render()");

        // Klonen Template-Knotens
        let blogSummary = document.getElementById("blog-summary").cloneNode(true);
        blogSummary.removeAttribute("id");

        // Einsetzen der Daten für den Post-hinzufügen-Button
        helper.setDataInfo(blogSummary, {bid: blogId} );

        // Article-Template für Posts erstellen und aus HTML entfernen
        let articleTempl = blogSummary.querySelector("article");
        articleTempl.remove();

        // Wenn der Blog Posts hat
        if (data[0]) {
            // Erstellen eines Articles für jeden Post
            for (let post of data) {
                post.setFormatDates(false)
                // Klonen des Template-Knotens
                let article = articleTempl.cloneNode(true);
                // Einhängen des Blogs
                blogSummary.appendChild(article);
                // Einsetzen der Daten
                helper.setDataInfo(article, post);
                // Wenn es nur einen Kommentar gibt, ändern von Plural zu Singular
                if (post.commentCount == 1) {
                    article.querySelector(".comment-count").innerHTML = "(1 Kommentar)";
                }
            }

            // Lokalen Event Listener für die Seite setzen
            blogSummary.addEventListener("click", handleDelete);

            // Lokaler Event Handler zum Entfernen von Posts
            function handleDelete(event) {
                let source = event.target;
                if (source) {
                    let action = source.dataset.action;
                    if (action === "delete-post" && confirm("Post wirklich löschen?")) {
                        let post = source.parentElement.closest("article");
                        post.remove();
                        presenter.delete(source.dataset.bid, source.dataset.pid, null);
                    }
                }
            }
        // Wenn der Blog leer ist
        } else {
            let headline = blogSummary.querySelector("h1");
            headline.remove();
        }
        return blogSummary;
    }
};

const postDetailView = {

    render(postData, commentData) {
        console.log("postDetailView.render()");

        // Klonen des Template-Knotens
        let postDetail = document.getElementById("post-detail").cloneNode(true);
        postDetail.removeAttribute("id");

        // Einsetzen der Daten für den Zurück-zur-Übersicht-Button
        helper.setDataInfo(postDetail, {bid: postData.bid} );

        // Article-Templates für Post und Kommentare erstellen und aus HTML entfernen
        let [post, commentTempl] = postDetail.querySelectorAll("article");
        post.remove();
        commentTempl.remove();

        // Headline entfernen, um sie später an geeigneter Stelle wieder einzufügen
        let commentHeadline = postDetail.querySelector("h4");
        commentHeadline.remove();

        // Einhängen des Posts
        postDetail.appendChild(post)
        // Modifizieren und Einsetzen der Daten
        postData.setFormatDates(true);
        helper.setDataInfo(post, postData);

        // Erstellen eines Articles für jeden Kommentar
        if (commentData) {
            // Einhängen der Headline
            postDetail.appendChild(commentHeadline);
            for (let comment of commentData) {
                // Klonen des Template-Knotens für den Article
                let article = commentTempl.cloneNode(true);
                // Einhängen des Kommentars
                postDetail.appendChild(article);
                // Modifizieren und Einsetzen der Daten
                comment.setFormatDates(true)
                helper.setDataInfo(article, comment);
            }
        } else {
            commentHeadline.innerHTML = "(Noch) Keine Kommentare";
            postDetail.appendChild(commentHeadline);
        }

        // Lokalen Event Listener für die Seite setzen
        postDetail.addEventListener("click", handleDelete);

        // Lokaler Event Handler zum Entfernen von Posts und Kommentaren
        function handleDelete(event) {
            let source = event.target;
            if (source) {
                let action = source.dataset.action;
                if (action === "delete-post" && confirm("Post wirklich löschen?")) {
                    let post = source.parentElement.closest("article");
                    post.remove();
                    presenter.delete(source.dataset.bid, source.dataset.pid, null);
                }
                if (action === "delete-comment" && confirm("Kommentar wirklich löschen?")) {
                    let comment = source.parentElement.closest("article");
                    comment.remove();
                    presenter.delete(source.dataset.bid, source.dataset.pid, source.dataset.cid);
                }
            }
        }

        return postDetail;
    }
};

// Formular fuer das Editieren eines Posts
const postEditView = {

    render(data) {
        console.log("postEditView.render()");

        // Klonen des Template-Knotens für die Seite
        let div = document.getElementById("post-edit").cloneNode(true);
        div.removeAttribute('id');

        // Einsetzen der Daten
        data.setFormatDates(true);
        helper.setDataInfo(div, data);
        let title = div.querySelector("form");

        // Lokalen Event Listener für die Seite setzen
        div.addEventListener("click", handleSave);

        // Lokaler Event Handler
        function handleSave(event) {
            event.preventDefault();
            let action = event.target.dataset.action;
            if (action === "save") {
                if(title.title.value == "") {
                    alert("Post muss einen Titel haben");
                } else {
                    if (confirm("Änderungen speichern?")) {
                        let content = document.getElementById("post-content")
                        let post = {bid: data.bid, pid: data.pid, title: title.title.value, content: content.innerHTML};
                        presenter[action](post);
                    }
                }
            } else if (action === "cancel" && confirm("Änderungen verwerfen?")) {
                presenter[action]();
            }
        }

        return div;
    }
};

// Formular fuer das Erstellen eines neuen Posts
const postAddView = {

    render(data) {
        console.log("postAddView.render()");

        // Klonen des Template-Knotens für die Seite
        let div = document.getElementById("post-add").cloneNode(true);
        div.removeAttribute('id');

        // Einsetzen der Daten
        helper.setDataInfo(div, data);
        let form = div.querySelector("form");

        // Lokalen Event Listener für die Seite setzen
        div.addEventListener("click", handleSave);

        // Lokaler Event Handler
        function handleSave(event) {
            event.preventDefault();
            let action = event.target.dataset.action;
            if (action === "save") {
                if(form.title.value == "") {
                    alert("Post muss einen Titel haben");
                } else {
                    if(confirm("Post veröffentlichen?")) {
                        let post = {bid: data.bid, pid: data.pid, title: form.title.value, content: form.content.value};
                        presenter[action](post);
                    }
                }
            } else if (action === "cancel" && confirm("Änderungen verwerfen?")) {
                presenter[action]();
            }
        }

        return div;
    }
};

const helper = {

    // Ersetzt alle %-Bezeichner in element durch die gleichnamigen Attributwerte in object
    setDataInfo(element, object) {
        let cont = element.innerHTML;
        for (let key in object) {
            let rexp = new RegExp("%" + key, "g");
            cont = cont.replace(rexp, object[key]);
        }
        element.innerHTML = cont;
    },

    setNavButtons(template) {
        // Klonen des Button-Komponententemplates
        let buttons = document.getElementById("buttons").cloneNode(true);
        buttons.removeAttribute("id");
        // Buttons in die Navigation einsetzen
        let nav = template.querySelector("nav");
        nav.append(buttons);
    }
    
};
