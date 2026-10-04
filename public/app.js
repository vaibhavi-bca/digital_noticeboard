let allNotices = [];


// ==========================================
// LOAD NOTICES
// ==========================================

async function loadNotices() {

    try {

        const response = await fetch("/api/notices");

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        allNotices = data.notices;

        updateStats();

        displayNotices(allNotices);

    } catch (error) {

        console.error(error);

        document.getElementById("noticeContainer").innerHTML = `
            <div class="empty-state">
                <h3>Unable to load notices</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}


// ==========================================
// DISPLAY NOTICES
// ==========================================

function displayNotices(notices) {

    const container =
        document.getElementById("noticeContainer");

    if (notices.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>No notices found</h3>

                <p>
                    Try changing your search or filter.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = notices.map(notice => {

        const priorityClass =
            notice.priority.toLowerCase();

        return `

            <div class="notice-card">

                <div class="notice-top">

                    <span class="category">
                        ${notice.category}
                    </span>

                    <span class="priority ${priorityClass}">
                        ${notice.priority}
                    </span>

                </div>


                <h3>
                    ${escapeHTML(notice.title)}
                </h3>


                <p>
                    ${escapeHTML(notice.description)}
                </p>


                <div class="notice-footer">

                    <span>
                        👤 ${escapeHTML(notice.posted_by || "Admin")}
                    </span>

                    <span>
                        📅 ${formatDate(notice.created_at)}
                    </span>

                </div>

            </div>

        `;

    }).join("");
}


// ==========================================
// STATISTICS
// ==========================================

function updateStats() {

    document.getElementById("totalNotices").textContent =
        allNotices.length;


    document.getElementById("importantNotices").textContent =
        allNotices.filter(
            n => n.priority === "Important" ||
                 n.priority === "Urgent"
        ).length;


    document.getElementById("pinnedNotices").textContent =
        allNotices.filter(
            n => n.is_pinned
        ).length;
}


// ==========================================
// SEARCH
// ==========================================

document
    .getElementById("searchInput")
    .addEventListener("input", filterNotices);


document
    .getElementById("categoryFilter")
    .addEventListener("change", filterNotices);


document
    .getElementById("priorityFilter")
    .addEventListener("change", filterNotices);


function filterNotices() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    const category =
        document
            .getElementById("categoryFilter")
            .value;


    const priority =
        document
            .getElementById("priorityFilter")
            .value;


    const filtered = allNotices.filter(notice => {

        const matchesSearch =
            notice.title
                .toLowerCase()
                .includes(search) ||

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

    });


    displayNotices(filtered);
}


// ==========================================
// HELPERS
// ==========================================

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ==========================================
// INITIAL LOAD
// ==========================================

loadNotices();