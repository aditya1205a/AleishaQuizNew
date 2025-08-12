// EmailJS initialization
(function() {
    emailjs.init("k-fel7IOR12ppDslo");
})();

// Store selected questions globally
let questions = [];
let currentQuestionIndex = 0;

// Load questions based on subject
function loadQuestions() {
    const subject = document.getElementById('subjectSelect').value;
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            const filteredQuestions = data.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
            if (filteredQuestions.length < 15) {
                showFeedback("😔 Not enough questions for this subject! Try another one, Aleisha!");
                return;
            }
            questions = getRandomQuestions(filteredQuestions, 15);
            currentQuestionIndex = 0;
            displayQuestions(questions);
            updateProgress();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.innerText = "😔 Oops! Couldn’t load questions. Try again, Aleisha!";
            errorDiv.style.display = 'block';
        });
}

// Function to pick random questions
function getRandomQuestions(arr, num) {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// Update progress bar
function updateProgress() {
    const progress = document.getElementById('progress');
    progress.style.display = 'block';
    progress.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length} 🎉`;
}

// Display questions on page
function displayQuestions(questions) {
    const container = document.getElementById('questions');
    container.innerHTML = '';
    document.getElementById('errorMessage').style.display = 'none';
    questions.forEach((q, index) => {
        const div = document.createElement('div');
        div.classList.add('question-block');
        let inputHtml = q.options 
            ? q.options.map((option, i) => `
                <label>
                    <input type="radio" name="answer${index}" value="${option}" required>
                    ${option}
                </label><br>
              `).join('')
            : `<input type="text" name="answer${index}" placeholder="Your answer, Aleisha!" />`;
        div.innerHTML = `
            <p><strong>Q${index + 1}:</strong> ${q.question}</p>
            ${q.image ? `<img src="${q.image}" alt="Question image" style="max-width:150px; border-radius:5px; margin:10px 0;">` : ''}
            ${inputHtml}
        `;
        container.appendChild(div);
    });
    document.querySelectorAll('#questions input').forEach((input, index) => {
        input.addEventListener('change', () => {
            if (index > currentQuestionIndex) {
                currentQuestionIndex = index;
                updateProgress();
            }
        });
    });
}

// Show feedback in modal
function showFeedback(message) {
    const feedbackText = document.getElementById('feedbackText');
    feedbackText.innerText = message;
    document.getElementById('feedbackModal').style.display = 'block';
    if (message.includes("Awesome") || message.includes("Super") || message.includes("Wow")) {
        const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti({ emojis: ['🎉', '🌟', '🚀'] });
    }
}

// Send answers via EmailJS
function submitAnswers(e) {
    e.preventDefault();
    const inputs = document.querySelectorAll('#questions input');
    let allAnswered = true;
    inputs.forEach((input, index) => {
        if (!input.value.trim()) {
            allAnswered = false;
            input.style.border = '2px solid red';
        } else {
            input.style.border = '';
        }
    });
    if (!allAnswered) {
        showFeedback("Please answer all questions, Aleisha! You’ve got this! 💪");
        return;
    }
    const answers = [];
    let score = 0;
    inputs.forEach((input, index) => {
        const userAnswer = input.value.trim();
        const correctAnswer = questions[index].answer;
        const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        answers.push(`Q${index + 1}: ${questions[index].question}\nYour Answer: ${userAnswer} ${isCorrect ? '✅' : '❌ (Correct: ' + correctAnswer + ')'}`);
        if (isCorrect) score++;
    });
    const feedbackMessages = [
        `🎉 Awesome job, Aleisha! You got ${score}/15! Your answers were sent!`,
        `🌟 Super work, Aleisha! You scored ${score}/15! Results sent!`,
        `🚀 Wow, Aleisha, you nailed ${score}/15! Check your email!`
    ];
    const feedback = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
    const params = {
        answers: answers.join('\n\n'),
        date: new Date().toLocaleDateString(),
        user_name: "Aleisha Aditya Ashok",
        score: `${score}/15`,
        subject: document.getElementById('subjectSelect').value
    };
    emailjs.send("service_mvgtdzj", "template_e6smd0o", params)
        .then(() => {
            showFeedback(feedback);
            inputs.forEach(input => input.value = '');
            loadQuestions();
        }, (error) => {
            showFeedback("😔 Oops! Something went wrong. Try again, Aleisha!");
            console.error("EmailJS Error:", error);
        });
}

// Event listener for form submission
document.getElementById('quizForm').addEventListener('submit', submitAnswers);

// Load questions on page load
loadQuestions();