// Initialize EmailJS
(function () {
    emailjs.init("k-fel7IOR12ppDslo"); // Your public key
})();

let allQuestions = [];
let selectedQuestions = [];

// Load questions when page loads
window.onload = function () {
    loadQuestions();
};

function loadQuestions() {
    const subject = document.getElementById("subjectSelect").value;
    document.getElementById("errorMessage").style.display = "none"; // Hide error message initially

    console.log("Selected subject:", subject); // Debug

    fetch("questions.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data); // Debug
            allQuestions = data;
            let filtered = subject === "all"
                ? allQuestions
                : allQuestions.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
            console.log("Filtered questions:", filtered); // Debug

            if (filtered.length === 0) {
                document.getElementById("errorMessage").innerText = `⚠️ No questions found for ${subject}. Please check questions.json or try another subject.`;
                document.getElementById("errorMessage").style.display = "block";
                return;
            }

            selectedQuestions = [];
            while (selectedQuestions.length < 15 && filtered.length > 0) {
                const randomIndex = Math.floor(Math.random() * filtered.length);
                selectedQuestions.push(filtered[randomIndex]);
                filtered.splice(randomIndex, 1);
            }

            displayQuestions();
        })
        .catch(err => {
            console.error("Error loading questions:", err);
            document.getElementById("errorMessage").innerText = `⚠️ Oops! Could not load questions. Error: ${err.message}`;
            document.getElementById("errorMessage").style.display = "block";
        });
}

function displayQuestions() {
    const container = document.getElementById("questions");
    const progress = document.getElementById("progress");
    container.innerHTML = "";

    if (selectedQuestions.length === 0) {
        container.innerHTML = "<p>No questions available for this subject. Please try another!</p>";
        return;
    }

    progress.innerHTML = `<p>Questions: ${selectedQuestions.length}/15</p>`;

    selectedQuestions.forEach((q, index) => {
        let inputHTML = "";
        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            inputHTML = q.options.map(option => `
                <label>
                    <input type="radio" name="question${index}" value="${option}" required>
                    ${option}
                </label>
            `).join("<br>");
        } else {
            inputHTML = `
                <input type="text" name="question${index}" placeholder="Type your answer here" required>
            `;
        }
        container.innerHTML += `
            <div class="question-block">
                <p><strong>Q${index + 1}:</strong> ${q.question}</p>
                ${inputHTML}
            </div>
        `;
    });
}

document.getElementById("quizForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let score = 0;
    let results = "";
    let feedbackHTML = "<h3>🎉 Your Quiz Results, Aleisha! 🎉</h3>";
    let allAnswered = true;

    selectedQuestions.forEach((q, index) => {
        const inputEl = document.querySelector(`input[name="question${index}"]:checked`) ||
                        document.querySelector(`input[name="question${index}"]`);
        const userAnswer = inputEl ? inputEl.value.trim() : "";
        if (!userAnswer) {
            allAnswered = false;
            return;
        }
        const isCorrect = userAnswer.toLowerCase() === q.answer.toLowerCase();
        if (isCorrect) {
            score++;
        }
        results += `Q${index + 1}: ${q.question}\nYour answer: ${userAnswer}\nCorrect answer: ${q.answer}\n${isCorrect ? "Correct ✅" : "Wrong ❌"}\n\n`;
        feedbackHTML += `
            <div style="margin: 10px 0;">
                <p><strong>Q${index + 1}:</strong> ${q.question}</p>
                <p>Your answer: ${userAnswer} ${isCorrect ? "✅ Correct!" : "❌ Wrong"}</p>
                ${!isCorrect ? `<p>Correct answer: ${q.answer}</p>` : ""}
            </div>
        `;
    });

    feedbackHTML = `<h3>🎉 Your Quiz Results, Aleisha! 🎉</h3><p>You scored ${score}/${selectedQuestions.length}!</p>` + feedbackHTML;

    if (!allAnswered) {
        document.getElementById("errorMessage").innerText = "Please answer all questions!";
        document.getElementById("errorMessage").style.display = "block";
        return;
    }

    const formData = {
        name: "Aleisha",
        user_name: "Aleisha",
        score: `${score} / ${selectedQuestions.length}`,
        answers: results,
        subject: document.getElementById("subjectSelect").value,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    emailjs.send("service_mvgtdzj", "template_e6smd0o", formData)
        .then(() => {
            document.getElementById("feedbackText").innerHTML = feedbackHTML;
            document.getElementById("feedbackModal").style.display = "block";
            const confetti = new JSConfetti();
            if (score >= 10) {
                confetti.addConfetti({ confettiNumber: 200 });
            } else {
                confetti.addConfetti();
            }
        })
        .catch((error) => {
            console.error("EmailJS error:", error);
            document.getElementById("errorMessage").innerText = `Failed to send email: ${error.text}`;
            document.getElementById("errorMessage").style.display = "block";
        });
});
