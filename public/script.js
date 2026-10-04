/* =========================================================
   DIGITAL NOTICE BOARD
   Frontend Demo
========================================================= */


/* =========================================================
   SAMPLE DATA
========================================================= */

const defaultNotices = [
    {
        id: 1,

        title: "Internal Examination Schedule",

        category: "Examination",

        priority: "Important",

        description:
            "Internal examinations will begin from 15 October 2026. Students are requested to check the detailed timetable and prepare accordingly.",

        noticeDate: "2026-10-03",

        expiryDate: "2026-10-20",

        postedBy: "Examination Department",

        isPinned: true
    },

    {
        id: 2,

        title: "TCS Campus Placement Drive",

        category: "Placement",

        priority: "Urgent",

        description:
            "TCS campus placement registration is now open. Eligible students should complete registration before the deadline.",

        noticeDate: "2026-10-02",

        expiryDate: "2026-10-10",

        postedBy: "Placement Cell",

        isPinned: true
    },

    {
        id: 3,

        title: "Coding Competition 2026",

        category: "Events",

        priority: "Normal",

        description:
            "The Computer Department is organizing an inter-college coding competition. Students can register individually or as teams.",

        noticeDate: "2026-10-01",

        expiryDate: "2026-10-18",

        postedBy: "Computer Department",

        isPinned: false
    },

    {
        id: 4,

        title: "Annual Sports Meet",

        category: "Sports",

        priority: "Normal",

        description:
            "Registrations are open for the annual sports meet. Students interested in participating can register with the Sports Department.",

        noticeDate: "2026-09-30",

        expiryDate: "2026-10-15",

        postedBy: "Sports Department",

        isPinned: false
    },

    {
        id: 5,

        title: "Photography Club Meeting",

        category: "Clubs",

        priority: "Normal",

        description:
            "The Photography Club will conduct its monthly meeting on Friday. All registered members are requested to attend.",

        noticeDate: "2026-09-29",

        expiryDate: "2026-10-12",

        postedBy: "Photography Club",

        isPinned: false
    },

    {
        id: 6,

        title: "College Holiday Notice",

        category: "General",

        priority: "Important",

        description:
            "The college will remain closed on the upcoming public holiday. Regular classes will resume on the following working day.",

        noticeDate: "2026-09-28",

        expiryDate: "2026-10-08",

        postedBy: "Administration",

        isPinned: false
    }
];


/* =========================================================
   LOAD NOTICES
========================================================= */

let notices = JSON.parse(
    localStorage.getItem("digitalNoticeBoardNotices")
);

if (!notices || notices.length === 0) {

    notices = defaultNotices;

    saveNotices();
}


/* =========================================================
   SAVE TO LOCAL STORAGE
========================================================= */

function saveNotices() {

    localStorage.setItem(
        "digitalNoticeBoardNotices",
        JSON.stringify(notices)
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    renderDashboard();

    renderAllNotices();

    setTodayDate();

    loadTheme();

});


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    updateStatistics();

    renderPinnedNotices();

    renderRecentNotices();

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const total = notices.length;

    const today = new Date();

    const active = notices.filter(notice => {

        return new Date(notice.expiryDate) >= today;

    }).length;


    const important = notices.filter(notice => {

        return (
            notice.priority === "Important" ||
            notice.priority === "Urgent"
        );

    }).length;


    const pinned = notices.filter(
        notice => notice.isPinned
    ).length;


    document.getElementById("totalNotices").textContent =
        total;

    document.getElementById("activeNotices").textContent =
        active;

    document.getElementById("importantNotices").textContent =
        important;

    document.getElementById("pinnedNotices").textContent =
        pinned;
}


/* =========================================================
   PINNED NOTICES
========================================================= */

function renderPinnedNotices() {

    const container =
        document.getElementById("pinnedContainer");


    const pinned = notices.filter(
        notice => notice.isPinned
    );


    if (pinned.length === 0) {

        container.innerHTML = emptyState(
            "📌",
            "No pinned notices"
        );

        return;
    }


    container.innerHTML = pinned
        .slice(0, 3)
        .map(createNoticeCard)
        .join("");
}


/* =========================================================
   RECENT NOTICES
========================================================= */

function renderRecentNotices() {

    const container =
        document.getElementById("recentContainer");


    const recent = [...notices]

        .sort(
            (a, b) =>
                new Date(b.noticeDate) -
                new Date(a.noticeDate)
        )

        .slice(0, 3);


    if (recent.length === 0) {

        container.innerHTML = emptyState(
            "📋",
            "No notices available"
        );

        return;
    }


    container.innerHTML =
        recent.map(createNoticeCard).join("");
}


/* =========================================================
   ALL NOTICES
========================================================= */

function renderAllNotices() {

    const container =
        document.getElementById(
            "allNoticesContainer"
        );


    const search =
        document.getElementById(
            "searchInput"
        )?.value
        .toLowerCase()
        .trim() || "";


    const category =
        document.getElementById(
            "categoryFilter"
        )?.value || "all";


    const priority =
        document.getElementById(
            "priorityFilter"
        )?.value || "all";


    const filtered = notices.filter(notice => {

        const matchesSearch =

            notice.title
                .toLowerCase()
                .includes(search)

            ||

            notice.description
                .toLowerCase()
                .includes(search)

            ||

            notice.category
                .toLowerCase()
                .includes(search);


        const matchesCategory =

            category === "all" ||

            notice.category === category;


        const matchesPriority =

            priority === "all" ||

            notice.priority === priority;


        return (
            matchesSearch &&
            matchesCategory &&
            matchesPriority
        );

    });


    if (filtered.length === 0) {

        container.innerHTML = emptyState(
            "🔍",
            "No matching notices found"
        );

        return;
    }


    container.innerHTML =
        filtered.map(createNoticeCard).join("");
}


/* =========================================================
   CREATE NOTICE CARD
========================================================= */

function createNoticeCard(notice) {

    const expired =
        new Date(notice.expiryDate) <
        new Date();


    const priorityClass =
        notice.priority.toLowerCase();


    return `

        <article class="notice-card">

            <div class="notice-top">

                <div class="badges">

                    <span class="badge category-badge">
                        ${escapeHTML(notice.category)}
                    </span>

                    <span class="badge priority-${priorityClass}">
                        ${escapeHTML(notice.priority)}
                    </span>

                </div>


                ${
                    notice.isPinned
                        ? `<span class="pin">📌</span>`
                        : ""
                }

            </div>


            <h3>
                ${escapeHTML(notice.title)}
            </h3>


            <p class="notice-description">
                ${escapeHTML(notice.description)}
            </p>


            <div class="notice-meta">

                <span class="posted-by">
                    👤 ${escapeHTML(notice.postedBy)}
                </span>

                <span class="notice-date">
                    ${formatDate(notice.noticeDate)}
                </span>

            </div>


            ${
                expired
                    ? `
                    <div style="
                        margin-top:10px;
                        color:#dc2626;
                        font-size:11px;
                        font-weight:700;
                    ">
                        ⚠️ Expired
                    </div>
                    `
                    : `
                    <div style="
                        margin-top:10px;
                        color:#16a34a;
                        font-size:11px;
                        font-weight:700;
                    ">
                        ● Active until ${formatDate(notice.expiryDate)}
                    </div>
                    `
            }


            <div class="notice-actions">

                <button
                    class="small-button"
                    onclick="editNotice(${notice.id})"
                >
                    ✏️ Edit
                </button>


                <button
                    class="small-button"
                    onclick="togglePin(${notice.id})"
                >
                    ${
                        notice.isPinned
                            ? "📍 Unpin"
                            : "📌 Pin"
                    }
                </button>


                <button
                    class="small-button delete"
                    onclick="deleteNotice(${notice.id})"
                >
                    🗑️ Delete
                </button>

            </div>

        </article>

    `;
}


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyState(icon, message) {

    return `

        <div class="empty-state">

            <div>${icon}</div>

            <p>${message}</p>

        </div>

    `;
}


/* =========================================================
   OPEN MODAL
========================================================= */

function openNoticeModal() {

    const modal =
        document.getElementById(
            "noticeModal"
        );


    document.getElementById(
        "noticeForm"
    ).reset();


    document.getElementById(
        "noticeId"
    ).value = "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Create New Notice";


    document.getElementById(
        "noticeDate"
    ).value =
        getToday();


    modal.classList.add("active");
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeNoticeModal() {

    document
        .getElementById("noticeModal")
        .classList
        .remove("active");
}


/* =========================================================
   FORM SUBMIT
========================================================= */

document
    .getElementById("noticeForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const id =
            document.getElementById(
                "noticeId"
            ).value;


        const noticeData = {

            title:
                document.getElementById(
                    "title"
                ).value.trim(),

            category:
                document.getElementById(
                    "category"
                ).value,

            priority:
                document.getElementById(
                    "priority"
                ).value,

            description:
                document.getElementById(
                    "description"
                ).value.trim(),

            noticeDate:
                document.getElementById(
                    "noticeDate"
                ).value,

            expiryDate:
                document.getElementById(
                    "expiryDate"
                ).value,

            postedBy:
                document.getElementById(
                    "postedBy"
                ).value.trim(),

            isPinned:
                document.getElementById(
                    "isPinned"
                ).checked
        };


        /* EDIT */

        if (id) {

            const index =
                notices.findIndex(
                    notice =>
                        notice.id === Number(id)
                );


            if (index !== -1) {

                notices[index] = {

                    id: Number(id),

                    ...noticeData

                };

                showToast(
                    "Notice updated successfully!",
                    "✓"
                );
            }

        }


        /* CREATE */

        else {

            notices.unshift({

                id: Date.now(),

                ...noticeData

            });


            showToast(
                "Notice created successfully!",
                "✓"
            );
        }


        saveNotices();

        renderDashboard();

        renderAllNotices();

        closeNoticeModal();

    });


/* =========================================================
   EDIT NOTICE
========================================================= */

function editNotice(id) {

    const notice =
        notices.find(
            notice => notice.id === id
        );


    if (!notice) return;


    document.getElementById(
        "noticeId"
    ).value = notice.id;


    document.getElementById(
        "title"
    ).value = notice.title;


    document.getElementById(
        "category"
    ).value = notice.category;


    document.getElementById(
        "priority"
    ).value = notice.priority;


    document.getElementById(
        "description"
    ).value = notice.description;


    document.getElementById(
        "noticeDate"
    ).value = notice.noticeDate;


    document.getElementById(
        "expiryDate"
    ).value = notice.expiryDate;


    document.getElementById(
        "postedBy"
    ).value = notice.postedBy;


    document.getElementById(
        "isPinned"
    ).checked = notice.isPinned;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Notice";


    document
        .getElementById("noticeModal")
        .classList
        .add("active");

}


/* =========================================================
   DELETE NOTICE
========================================================= */

function deleteNotice(id) {

    const notice =
        notices.find(
            notice => notice.id === id
        );


    if (!notice) return;


    const confirmed =
        confirm(
            `Are you sure you want to delete "${notice.title}"?`
        );


    if (!confirmed) return;


    notices =
        notices.filter(
            notice => notice.id !== id
        );


    saveNotices();

    renderDashboard();

    renderAllNotices();


    showToast(
        "Notice deleted successfully!",
        "✓"
    );
}


/* =========================================================
   PIN / UNPIN
========================================================= */

function togglePin(id) {

    const notice =
        notices.find(
            notice => notice.id === id
        );


    if (!notice) return;


    notice.isPinned =
        !notice.isPinned;


    saveNotices();

    renderDashboard();

    renderAllNotices();


    showToast(
        notice.isPinned
            ? "Notice pinned!"
            : "Notice unpinned!",
        "📌"
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(section) {

    const dashboard =
        document.getElementById(
            "dashboardSection"
        );

    const noticesSection =
        document.getElementById(
            "noticesSection"
        );


    if (section === "dashboard") {

        dashboard.classList.remove("hidden");

        noticesSection.classList.add("hidden");

    }

    else {

        dashboard.classList.add("hidden");

        noticesSection.classList.remove("hidden");

        renderAllNotices();

    }


    document
        .querySelectorAll(".nav-link")
        .forEach(button => {

            button.classList.remove("active");

        });


    const buttons =
        document.querySelectorAll(
            ".nav-link"
        );


    if (section === "dashboard") {

        buttons[0].classList.add("active");

    }

    else {

        buttons[1].classList.add("active");

    }

}


/* =========================================================
   DARK MODE
========================================================= */

function toggleTheme() {

    document.body.classList.toggle("dark");


    const dark =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "noticeBoardTheme",
        dark ? "dark" : "light"
    );


    document.getElementById(
        "themeToggle"
    ).textContent =
        dark ? "☀️" : "🌙";
}


/* =========================================================
   LOAD THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            "noticeBoardTheme"
        );


    if (theme === "dark") {

        document.body.classList.add("dark");

        document.getElementById(
            "themeToggle"
        ).textContent = "☀️";
    }
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, icon = "✓") {

    const toast =
        document.getElementById("toast");

    document.getElementById(
        "toastMessage"
    ).textContent = message;

    document.getElementById(
        "toastIcon"
    ).textContent = icon;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* =========================================================
   DATE HELPERS
========================================================= */

function getToday() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function setTodayDate() {

    const input =
        document.getElementById(
            "noticeDate"
        );


    if (input) {

        input.value =
            getToday();

    }
}


function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   SECURITY HELPER
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

document
    .getElementById("noticeModal")
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target === this
            ) {

                closeNoticeModal();

            }

        }
    );