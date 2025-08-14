// Initialize JSConfetti for celebrations
const jsConfetti = new JSConfetti();

let allQuestions = {};
let selectedQuestions = [];
let currentSubject = 'Math';

// Load questions from questions.json
async function loadQuestions() {
    currentSubject = document.getElementById("subjectSelect").value;
    const questionsDiv = document.getElementById("questions");
    const progressDiv = document.getElementById("progress");
    const errorDiv = document.getElementById("errorMessage");

    questionsDiv.innerHTML = '';
    progressDiv.innerHTML = '';
    errorDiv.style.display = 'none';

    try {
        // Fetch only once if not already loaded
        if (Object.keys(allQuestions).length === 0) {
            const response = await fetch('questions.json');
            if (!response.ok) throw new Error('Failed to load questions.');
            allQuestions = await response.json();
        }

        if (!allQuestions[currentSubject] || allQuestions[currentSubject].length === 0) {
            throw new Error(`No questions found for ${currentSubject}`);
        }

        // Pick 15 random questions
        selectedQuestions = allQuestions[currentSubject]
            .sort(() => 0.5 - Math.random())
            .slice(0, 15);

        selectedQuestions.forEach((q, index) => {
            const questionHTML = `
                <div class="question">
                    <p><strong>Q${index + 1}:</strong> ${q.question}</p>
                    ${q.options.map((opt, i) => `
                        <label>
                            <input type="radio" name="q${index}" value="${opt}" required>
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            `;
            questionsDiv.innerHTML += questionHTML;
        });

    } catch (error) {
        console.error(error);
        errorDiv.innerText = "⚠️ Oops! Could not load questions. Please try again later.";
        errorDiv.style.display = 'block';
    }
}

// Handle quiz submission
document.getElementById("quizForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let score = 0;
    const answers = {};

    selectedQuestions.forEach((q, index) => {
        const chosen = document.querySelector(`input[name="q${index}"]:checked`);
        if (chosen) {
            answers[`Q${index + 1}`] = {
                question: q.question,
                selected: chosen.value,
                correct: q.answer
            };
            if (chosen.value === q.answer) score++;
        }
    });

    // Show feedback modal
    const feedbackText = document.getElementById("feedbackText");
    feedbackText.innerHTML = `🎯 You scored ${score} / ${selectedQuestions.length}!`;
    document.getElementById("feedbackModal").style.display = "block";

    // Confetti if good score
    if (score >= 10) jsConfetti.addConfetti();

    // Send results via EmailJS
    emailjs.send("service_fup2fgs", "template_b1dht5r", {
        subject: currentSubject,
        score: `${score} / ${selectedQuestions.length}`,
        details: JSON.stringify(answers, null, 2)
    }).then(() => {
        console.log("✅ Results sent to email.");
    }).catch(err => {
        console.error("❌ Email send failed:", err);
    });
});

// Load default questions on page load
window.onload = loadQuestions;
