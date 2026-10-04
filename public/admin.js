let allNotices = [];

let editingNoticeId = null;


// ==========================================
// CHECK ADMIN LOGIN
// ==========================================

async function checkAdmin() {

    try {

        const response =
            await fetch("/api/auth/me");


        if (!response.ok) {

            window.location.href = "login.html";

            return;
        }


        const data =
            await response.json();


        document.getElementById("adminName").textContent =
            data.admin.name || data.admin.username;


        loadNotices();

    } catch (error) {

        console.error(error);

        window.location.href = "login.html";

    }
}


// ==========================================
// LOAD NOTICES
// ==========================================

async function loadNotices() {

    try {

        const response =
            await fetch("/api/notices");


        const data =
            await response.json();


        if (!data.success) {

            showToast(
                "Unable to load notices"
            );

            return;
        }


        allNotices = data.notices;


        updateStats();

        displayNotices(allNotices);

    } catch (error) {

        console.error(error);

        showToast(
            "Server connection failed"
        );
    }
}


// ==========================================
// DISPLAY NOTICES
// ==========================================

function displayNotices(notices) {

    const container =
        document.getElementById(
            "noticeContainer"
        );


    if (notices.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No notices found
                </h3>

                <p>
                    Click "Add New Notice"
                    to create one.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        notices.map(notice => {

            const priority =
                notice.priority || "Normal";


            const pinText =
                notice.is_pinned
                    ? "📌 Unpin"
                    : "📌 Pin";


            return `

                <div class="admin-notice-card">

                    <div class="notice-top">

                        <span class="category">
                            ${escapeHTML(
                                notice.category
                            )}
                        </span>

                        <span class="
                            priority
                            ${priority.toLowerCase()}
                        ">
                            ${escapeHTML(
                                priority
                            )}
                        </span>

                    </div>


                    <h3>
                        ${escapeHTML(
                            notice.title
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            notice.description
                        )}
                    </p>


                    <div class="notice-footer">

                        <span>
                            👤
                            ${escapeHTML(
                                notice.posted_by || "Admin"
                            )}
                        </span>

                        <span>
                            📅
                            ${formatDate(
                                notice.created_at
                            )}
                        </span>

                    </div>


                    <div class="
                        admin-notice-actions
                    ">

                        <button
                            class="
                                action-btn
                                edit-btn
                            "
                            onclick="
                                editNotice(
                                    ${notice.id}
                                )
                            "
                        >
                            ✏️ Edit
                        </button>


                        <button
                            class="
                                action-btn
                                pin-btn
                            "
                            onclick="
                                togglePin(
                                    ${notice.id}
                                )
                            "
                        >
                            ${pinText}
                        </button>


                        <button
                            class="
                                action-btn
                                delete-btn
                            "
                            onclick="
                                deleteNotice(
                                    ${notice.id}
                                )
                            "
                        >
                            🗑 Delete
                        </button>

                    </div>

                </div>

            `;

        }).join("");
}


// ==========================================
// STATISTICS
// ==========================================

function updateStats() {

    document.getElementById(
        "totalNotices"
    ).textContent =
        allNotices.length;


    document.getElementById(
        "importantNotices"
    ).textContent =

        allNotices.filter(
            notice =>
                notice.priority === "Important" ||
                notice.priority === "Urgent"
        ).length;


    document.getElementById(
        "pinnedNotices"
    ).textContent =

        allNotices.filter(
            notice => notice.is_pinned
        ).length;
}


// ==========================================
// OPEN ADD MODAL
// ==========================================

document
    .getElementById("addNoticeBtn")
    .addEventListener(
        "click",
        openAddModal
    );


function openAddModal() {

    editingNoticeId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add New Notice";


    document.getElementById(
        "noticeForm"
    ).reset();


    document.getElementById(
        "noticeModal"
    ).classList.remove("hidden");
}


// ==========================================
// EDIT NOTICE
// ==========================================

function editNotice(id) {

    const notice =
        allNotices.find(
            item => item.id === id
        );


    if (!notice) {

        showToast(
            "Notice not found"
        );

        return;
    }


    editingNoticeId = id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Notice";


    document.getElementById(
        "noticeId"
    ).value =
        notice.id;


    document.getElementById(
        "title"
    ).value =
        notice.title;


    document.getElementById(
        "description"
    ).value =
        notice.description;


    document.getElementById(
        "category"
    ).value =
        notice.category;


    document.getElementById(
        "priority"
    ).value =
        notice.priority;


    document.getElementById(
        "postedBy"
    ).value =
        notice.posted_by || "";


    document.getElementById(
        "expiryDate"
    ).value =
        notice.expiry_date
            ? notice.expiry_date.substring(0, 10)
            : "";


    document.getElementById(
        "isPinned"
    ).checked =
        Boolean(notice.is_pinned);


    document.getElementById(
        "noticeModal"
    ).classList.remove("hidden");
}


// ==========================================
// SAVE NOTICE
// ==========================================

document
    .getElementById("noticeForm")
    .addEventListener(
        "submit",
        saveNotice
    );


async function saveNotice(event) {

    event.preventDefault();


    const noticeData = {

        title:
            document.getElementById(
                "title"
            ).value.trim(),

        description:
            document.getElementById(
                "description"
            ).value.trim(),

        category:
            document.getElementById(
                "category"
            ).value,

        priority:
            document.getElementById(
                "priority"
            ).value,

        posted_by:
            document.getElementById(
                "postedBy"
            ).value.trim(),

        expiry_date:
            document.getElementById(
                "expiryDate"
            ).value || null,

        is_pinned:
            document.getElementById(
                "isPinned"
            ).checked

    };


    try {

        let response;


        // UPDATE
        if (editingNoticeId) {

            response =
                await fetch(
                    `/api/notices/${editingNoticeId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                noticeData
                            )
                    }
                );

        }

        // CREATE
        else {

            response =
                await fetch(
                    "/api/notices",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                noticeData
                            )
                    }
                );

        }


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                window.location.href =
                    "login.html";

                return;
            }


            showToast(
                data.message ||
                "Operation failed"
            );

            return;
        }


        showToast(
            editingNoticeId
                ? "Notice updated successfully"
                : "Notice created successfully"
        );


        closeModal();


        loadNotices();

    } catch (error) {

        console.error(error);

        showToast(
            "Server error"
        );
    }
}


// ==========================================
// DELETE NOTICE
// ==========================================

async function deleteNotice(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this notice?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/notices/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                window.location.href =
                    "login.html";

                return;
            }


            showToast(
                data.message ||
                "Delete failed"
            );

            return;
        }


        showToast(
            "Notice deleted successfully"
        );


        loadNotices();

    } catch (error) {

        console.error(error);

        showToast(
            "Server error"
        );
    }
}


// ==========================================
// PIN / UNPIN
// ==========================================

async function togglePin(id) {

    const notice =
        allNotices.find(
            item => item.id === id
        );


    if (!notice) {
        return;
    }


    try {

        const updatedNotice = {

            title: notice.title,

            description:
                notice.description,

            category:
                notice.category,

            priority:
                notice.priority,

            posted_by:
                notice.posted_by,

            expiry_date:
                notice.expiry_date
                    ? notice.expiry_date.substring(0, 10)
                    : null,

            is_pinned:
                !Boolean(notice.is_pinned),

            status:
                notice.status || "Active"

        };


        const response =
            await fetch(
                `/api/notices/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updatedNotice
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to update pin"
            );

            return;
        }


        showToast(
            updatedNotice.is_pinned
                ? "Notice pinned"
                : "Notice unpinned"
        );


        loadNotices();

    } catch (error) {

        console.error(error);

        showToast(
            "Server error"
        );
    }
}


// ==========================================
// CLOSE MODAL
// ==========================================

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("cancelBtn")
    .addEventListener(
        "click",
        closeModal
    );


function closeModal() {

    document
        .getElementById(
            "noticeModal"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "noticeForm"
        )
        .reset();


    editingNoticeId = null;
}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async function(event) {

            event.preventDefault();


            try {

                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST"
                    }
                );

            } finally {

                window.location.href =
                    "login.html";
            }

        }
    );


// ==========================================
// SEARCH + FILTER
// ==========================================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        filterNotices
    );


document
    .getElementById("categoryFilter")
    .addEventListener(
        "change",
        filterNotices
    );


document
    .getElementById("priorityFilter")
    .addEventListener(
        "change",
        filterNotices
    );


function filterNotices() {

    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase();


    const category =
        document
            .getElementById(
                "categoryFilter"
            )
            .value;


    const priority =
        document
            .getElementById(
                "priorityFilter"
            )
            .value;


    const filtered =
        allNotices.filter(
            notice => {

                const matchesSearch =

                    notice.title
                        .toLowerCase()
                        .includes(search)

                    ||

                    notice.description
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    !category ||
                    notice.category === category;


                const matchesPriority =
                    !priority ||
                    notice.priority === priority;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesPriority
                );

            }
        );


    displayNotices(filtered);
}


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);
}


// ==========================================
// HELPERS
// ==========================================

function formatDate(date) {

    if (!date) {
        return "N/A";
    }


    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value || "";


    return div.innerHTML;
}


// ==========================================
// START
// ==========================================

checkAdmin();