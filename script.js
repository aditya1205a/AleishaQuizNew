// Load EmailJS
(function() {
    emailjs.init("k-fel7IOR12ppDslo");
})();

let allQuestions = [];
let questions = [];

function loadQuestions() {
    const subject = document.getElementById("subjectSelect").value;

    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            allQuestions = subject === "all" ? data : data.filter(q => q.subject === subject);
            questions = getRandomQuestions(allQuestions, 15);
            displayQuestions(questions);
        })
        .catch(error => console.error("Error loading questions:", error));
}

function getRandomQuestions(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayQuestions(questions) {
    const questionsDiv = document.getElementById("questions");
    questionsDiv.innerHTML = "";

    questions.forEach((q, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";

        const questionText = document.createElement("p");
        questionText.textContent = `${index + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);

        q.options.forEach(option => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `answer${index}`;
            input.value = option;
            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            questionDiv.appendChild(label);
            questionDiv.appendChild(document.createElement("br"));
        });

        questionsDiv.appendChild(questionDiv);
    });
}

document.getElementById("quizForm").addEventListener("submit", function(event) {
    event.preventDefault();
    submitAnswers();
});

function submitAnswers() {
    let score = 0;
    let answeredCount = 0;
    let userAnswers = [];

    questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="answer${index}"]:checked`);
        if (selected && selected.value.trim()) {
            answeredCount++;
            if (selected.value === q.answer) score++;
        }
        userAnswers.push(selected ? selected.value : "");
    });

    if (answeredCount !== questions.length) {
        showFeedback("Please answer all questions, Aleisha! 💪");
        return;
    }

    showFeedback(`🎉 You scored ${score} out of ${questions.length}, Aleisha! 🏆`);

    // Send results via EmailJS
    emailjs.send("service_mvgtdzj", "template_e6smd0o", {
        user_name: "Aleisha",
        score: score,
        total: questions.length,
        answers: JSON.stringify(userAnswers),
    })
    .then(response => {
        console.log("Results sent!", response.status, response.text);
    })
    .catch(error => {
        console.error("Failed to send results:", error);
    });
}

function showFeedback(message) {
    alert(message);
}

// Load questions initially
window.onload = loadQuestions;
