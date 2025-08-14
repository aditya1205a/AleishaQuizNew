// Initialize EmailJS
(function () {
    emailjs.init("k-fel7IOR12ppDslo"); // Your public key
})();

let allQuestions = [];
let selectedQuestions = [];

function loadQuestions() {
    const subject = document.getElementById("subjectSelect").value;

    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            allQuestions = data;
            let filtered = subject === "all"
                ? allQuestions
                : allQuestions.filter(q => q.subject === subject);

            // Pick 15 random questions
            selectedQuestions = [];
            while (selectedQuestions.length < 15 && filtered.length > 0) {
                const randomIndex = Math.floor(Math.random() * filtered.length);
                selectedQuestions.push(filtered[randomIndex]);
                filtered.splice(randomIndex, 1);
            }

            displayQuestions();
        })
        .catch(err => console.error("Error loading questions:", err));
}

function displayQuestions() {
    const container = document.getElementById("questions");
    container.innerHTML = "";

    selectedQuestions.forEach((q, index) => {
        const questionHTML = `
            <div class="question-block">
                <p><strong>Q${index + 1}:</strong> ${q.question}</p>
                ${q.options.map(option => `
                    <label>
                        <input type="radio" name="question${index}" value="${option}" required>
                        ${option}
                    </label>
                `).join("<br>")}
            </div>
        `;
        container.innerHTML += questionHTML;
    });
}

// Handle form submission
document.getElementById("quizForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let score = 0;
    let results = "";

    selectedQuestions.forEach((q, index) => {
        const userAnswer = document.querySelector(`input[name="question${index}"]:checked`);
        const answerValue = userAnswer ? userAnswer.value : "No answer";

        if (answerValue === q.answer) {
            score++;
        }

        results += `
Q${index + 1}: ${q.question}
Your answer: ${answerValue}
Correct answer: ${q.answer}

`;
    });

    const formData = {
        from_name: "Aleisha",
        score: `${score} / ${selectedQuestions.length}`,
        quiz_results: results
    };

    emailjs.send("service_mvgtdzj", "template_e6smd0o", formData)
        .then(() => {
            alert("Quiz submitted successfully!");
        })
        .catch((error) => {
            console.error("EmailJS error:", error);
        });
});
