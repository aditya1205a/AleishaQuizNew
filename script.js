// script.js

let questions = [];
let selectedSubject = "";
let currentQuestions = [];

// Load questions from JSON
fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;
    console.log("Questions loaded:", questions.length);
  })
  .catch(error => console.error("Error loading questions:", error));

function selectSubject(subject) {
  selectedSubject = subject;
  const subjectQuestions = questions.filter(q => q.subject === subject);

  if (subjectQuestions.length < 15) {
    showFeedback(`Not enough questions for ${subject}. Only found ${subjectQuestions.length}`);
    return;
  }

  currentQuestions = shuffleArray(subjectQuestions).slice(0, 15);
  showQuestions();
}

function showQuestions() {
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = "";

  currentQuestions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");

    const questionText = document.createElement("h3");
    questionText.textContent = q.question;

    questionDiv.appendChild(questionText);

    q.options.forEach(option => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `answer${index}`;
      input.value = option;
      label.appendChild(input);
      label.append(` ${option}`);
      questionDiv.appendChild(label);
    });

    quizContainer.appendChild(questionDiv);
  });

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit Answers";
  submitBtn.onclick = submitAnswers;
  quizContainer.appendChild(submitBtn);
}

function submitAnswers() {
  let score = 0;
  let answeredCount = 0;
  let resultsSummary = [];

  currentQuestions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="answer${index}"]:checked`);
    const userAnswer = selected ? selected.value : "";

    if (userAnswer) answeredCount++;
    if (userAnswer === q.answer) score++;

    resultsSummary.push(
      `Q${index + 1}: ${q.question}\n` +
      `Your answer: ${userAnswer || "No answer"} ${userAnswer === q.answer ? "✅" : "❌"}\n` +
      `Correct answer: ${q.answer}\n`
    );
  });

  if (answeredCount !== currentQuestions.length) {
    showFeedback("Please answer all questions, Aleisha! 💪");
    return;
  }

  showFeedback(`🎉 You scored ${score} out of ${currentQuestions.length}, Aleisha! 🏆`);

  emailjs.init("k-fel7IOR12ppDslo");

  emailjs.send("service_mvgtdzj", "template_e6smd0o", {
      user_name: "Aleisha",
      score: score,
      total: currentQuestions.length,
      detailed_results: resultsSummary.join("\n----------------------\n")
  })
  .then(response => {
      console.log("Results sent!", response.status, response.text);
  })
  .catch(error => {
      console.error("Failed to send results:", error);
  });
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showFeedback(message) {
  const feedbackDiv = document.getElementById("feedback");
  feedbackDiv.textContent = message;
}
