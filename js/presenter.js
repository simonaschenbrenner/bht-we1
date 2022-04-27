/* 
 * Web Engineering WS 20/21
 * Semsterprojekt SPA "Blogger"
 * Gruppe 12
 * Simon Nunez Aschenbrenner (908606)
 */

"use strict";

// Selbsaufrufende Funktionsdeklaration: (function name(){..} ) ();
const presenter = (function () {

    // Private Variablen und Funktionen
    let init = false;
    let detail = false;
    let blogId = -1;
    let postId = -1;
    let owner = undefined;

    // Initialisiert die allgemeinen (statischen) Teile der Seite
    function initPage() {

        console.log("presenter.initPage()");

        // Event Listener anmelden
        let main = document.getElementById("main-content");
        main.addEventListener("click", handleClicks);
        let blogNavigation = document.getElementById("blog-nav-slot");
        blogNavigation.addEventListener("click", handleClicks);

        // Nutzer abfragen und Anzeigenamen als owner setzen
        model.getSelf((result) => {
            owner = result.displayName;
            replace("user-slot", userView.render(owner));
        });

        model.getAllBlogs((blogs) => {
            if (!blogs[0]) {
                replace("blog-nav-slot", noBlogView.render());
            } else {
                replace("blog-nav-slot", blogNavigationView.render(blogs));
                // console.log(blogId);
                if (blogId === -1) blogId = blogs[0].bid;
                model.getBlog(blogId, (blog) => {
                    replace("current-blog-slot", currentBlogView.render(blog));
                    init = true;
                    // Falls auf Startseite, navigieren zur Uebersicht
                    if (window.location.pathname === "/"
                            || window.location.pathname === "/blogs"
                            || window.location.pathname === "/blogs/") {
                        router.navigateToPage("/blogs/" + blog.bid);
                    }
                });
            }
        });

    }

    // Sorgt dafür, dass bei einem nicht-angemeldeten Nutzer nur noch der Name der Anwendung und der Login-Button angezeigt wird
    function loginPage() {

        console.log("presenter.loginPage()");
        if(owner !== undefined) console.log(`Logout Nutzer*in ${owner}`);
        init = false;
        detail = false;
        blogId = -1;
        postId = -1;
        owner = undefined;
        replace("user-slot", null);
        replace("blog-nav-slot", null);
        replace("current-blog-slot", null);
        replace("main-content", null);
    }

    // Ersetzen von Elementen im DOM
    function replace(id, element) {

        let main = document.getElementById(id);
        let content = main.firstElementChild;
        if (content)
            content.remove();
        if (element)
            main.append(element);
    }

    // Event-Handler für Interaktionen, die zu einer anderen View navigieren (data-path Attribut)
    function handleClicks(event) {
        let source = null;

        // Behandelt werden clicks auf a-Tags, Buttons und Elemente, die in ein li-Tag eingebunden sind
        switch (event.target.tagName) {
            case "A":
                router.handleNavigationEvent(event);
                break;
            case "BUTTON":
                source = event.target;
                break;
            case "OBJECT":
                router.navigateToPage("/blogs");
                break;
            default:
                source = event.target.closest("LI");
                break;
        }
        if (source) {
            let path = source.dataset.path;
            if (path) {
                router.navigateToPage(path);
            }
        }
    }

    // Oeffentliche Methoden
    return {

        // Wird vom Router aufgerufen, wenn die Startseite betreten wird
        showStartPage() {
            console.log("presenter.showStartPage()");

            if (model.isLoggedIn()) { // Wenn der Nutzer eingeloggt ist
                blogId = -1;
                postId = -1;
                initPage();
            }
            if (!model.isLoggedIn()) { // Wenn der Nutzer eingeloggt war und sich abgemeldet hat
                loginPage();
            }
        },

        // Wird vom Router aufgerufen, wenn eine Blog-Übersicht angezeigt werden soll
        showBlogSummary(bid) {

            detail = false;
            let blogIdPrev = blogId;
            blogId = bid;
            console.log(`presenter.blogSummary(${blogId})`);

            if (!init) initPage();

            // Ggf. Austauschen der Blogübersicht im Header, falls die Seite zwar initialisiert, sich die bid aber geändert hat
            else if (blogIdPrev != blogId) {
                model.getBlog(blogId, (blog) => {
                    replace("current-blog-slot", currentBlogView.render(blog));
                });
            }

            model.getAllPostsOfBlog(blogId, (posts) => {
                // if (!posts) return;
                replace("main-content", blogSummaryView.render(posts, blogId));
            });
        },

        // Wird vom Router aufgerufen, wenn eine Post-Detailansicht angezeigt werden soll
        showPostDetail(bid, pid) {

            detail = true;
            blogId = bid;
            postId = pid;
            console.log(`presenter.showPostDetail(${blogId}, ${postId})`);

            if (!init) initPage(); 

            model.getPost(blogId, postId, (post) => {
                if (!post) {
                    return;
                } else {
                    if (post.commentCount === "0") {
                        replace("main-content", postDetailView.render(post, null));
                    } else {
                        model.getAllCommentsOfPost(blogId, postId, (comments) => {
                            replace("main-content", postDetailView.render(post, comments));
                        });
                    }
                }
            });
        },

        // Wird vom Router aufgerufen, wenn die Post-Hinzufügen-Ansicht angezeigt werden soll
        showAdd(bid) {

            detail = false;
            blogId = bid;
            postId = -1;
            console.log(`presenter.showAdd(${blogId})`);
            if (!init) initPage();
            let post = { bid: blogId, pid: postId, title: "", content: "" };
            replace("main-content", postAddView.render(post));
        },

        // Wird vom Router aufgerufen, wenn die Post-Editieren-Ansicht angezeigt werden soll
        showEdit(bid, pid) {
            
            detail = false;
            blogId = bid;
            postId = pid;
            console.log(`presenter.showEdit(${blogId}, ${postId})`);
            if (!init) initPage();
            model.getPost(blogId, postId, (post) => {
                if (!post) return;
                replace("main-content", postEditView.render(post));
                });
        },

        // Wird vom lokalen Event Listener einer View aufgerufen, wenn ein Formular (Post) gespeichert werden soll
        save(post) {
            console.log(`presenter.save(${post.pid})`);

            if (postId != -1) { // Neuer Post
                model.updatePost(post.bid, post.pid, post.title, post.content, (result) => {
                    alert(`Aktualisieren des Posts "${result.title}" war erfolgreich`);
                    router.navigateToPage("/posts/" + result.bid + "/" + result.pid);
                    });
            
            } else { // Geänderter Post
                model.addNewPost(post.bid, post.title, post.content, (result) => {
                    alert(`Erstellen des Posts "${result.title}" war erfolgreich`);
                    router.navigateToPage("/posts/" + result.bid + "/" + result.pid);
                });
            }
        },

        // Wird vom lokalen Event Listener einer View aufgerufen, wenn ein Formular (Post) nicht gespeichert werden soll
        cancel() {
            console.log("presenter.cancel()");
            router.goBack();
        },
    
        // Wird vom lokalen Event Listener einer View aufgerufen, wenn ein Post oder Kommentar gelöscht werden soll
        delete(bid, pid, cid) {
            console.log(`presenter.delete(${bid}, ${pid}, ${cid})`);

            if (cid) { // Kommentar löschen
                model.deleteComment(bid, pid, cid, () => {
                    alert("Kommentar wurde gelöscht");
                });

            } else { // Post löschen
                model.deletePost(bid, pid, () => {
                    alert("Post wurde gelöscht");
                    if (detail) {
                        router.navigateToPage("/blogs/" + bid);
                    }
                });
            }
        }  
    };
})();
