document.addEventListener('DOMContentLoaded', () => {
    const subjectButtons = document.querySelectorAll('.subject-btn');
    const questionContainer = document.getElementById('question-container');

    let questions = [];
    let remainingQuestions = [];
    let currentQuestion = null;

    let correctAnswers = 0;
    let answeredQuestions = 0;

    // Subject buttons from your HTML
    subjectButtons.forEach(button => {
        button.addEventListener('click', () => {
            subjectButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            const subject = button.dataset.subject;
            loadQuestions(subject);
        });
    });

    // Load the selected subject's JSON file
    async function loadQuestions(subject) {
        try {
            questionContainer.innerHTML = '<p>Loading questions...</p>';

            const response = await fetch(`../questions/${subject}.json`);

            if (!response.ok) {
                throw new Error(`Failed to load ${subject} questions`);
            }

            questions = await response.json();

            if (!questions.length) {
                questionContainer.innerHTML =
                    '<p>No questions found for this subject.</p>';
                return;
            }

            // Reset quiz
            correctAnswers = 0;
            answeredQuestions = 0;

            // Copy all questions
            remainingQuestions = [...questions];

            showScore();
            showRandomQuestion();

        } catch (error) {
            questionContainer.innerHTML =
                `<p>Error: ${error.message}</p>`;
        }
    }

    // Pick one random question
    function showRandomQuestion() {

        // No questions left
        if (remainingQuestions.length === 0) {
            showFinalScore();
            return;
        }

        // Pick random question
        const randomIndex =
            Math.floor(Math.random() * remainingQuestions.length);

        // Remove question so it cannot appear again
        currentQuestion =
            remainingQuestions.splice(randomIndex, 1)[0];

        displayQuestion(currentQuestion);
    }

    // Display one question
    function displayQuestion(question) {

        questionContainer.innerHTML = `
            <div class="question">

                <h3>Question</h3>

                <p>${question.question}</p>

                <div class="options">
                    ${question.options.map((option, index) => `
                        <div class="option">
                            <input
                                type="radio"
                                name="currentQuestion"
                                id="option-${index}"
                                value="${index}"
                            >

                            <label for="option-${index}">
                                ${option}
                            </label>
                        </div>
                    `).join('')}
                </div>

                <button
                    class="submit-btn"
                    id="submit-btn">
                    Submit
                </button>

                <div
                    class="feedback"
                    id="feedback">
                </div>

                <button
                    class="next-btn"
                    id="next-btn"
                    style="display: none;">
                    Next Question
                </button>

            </div>
        `;

        document
            .getElementById('submit-btn')
            .addEventListener('click', checkAnswer);

        document
            .getElementById('next-btn')
            .addEventListener('click', showRandomQuestion);
    }

    // Check the selected answer
    function checkAnswer() {

        const selectedOption =
            document.querySelector(
                'input[name="currentQuestion"]:checked'
            );

        if (!selectedOption) {
            alert('Please select an option!');
            return;
        }

        const userAnswer =
            parseInt(selectedOption.value);

        const feedback =
            document.getElementById('feedback');

        const submitButton =
            document.getElementById('submit-btn');

        const nextButton =
            document.getElementById('next-btn');

        answeredQuestions++;

        // Prevent changing the answer
        document
            .querySelectorAll('input[name="currentQuestion"]')
            .forEach(input => {
                input.disabled = true;
            });

        submitButton.disabled = true;

        // Correct answer
        if (userAnswer === currentQuestion.correctAnswer) {

            correctAnswers++;

            feedback.textContent = 'Correct!';
            feedback.className = 'feedback correct';

        } else {

            const correctOption =
                currentQuestion.options[
                    currentQuestion.correctAnswer
                ];

            feedback.textContent =
                `Incorrect! The correct answer is: ${correctOption}`;

            feedback.className =
                'feedback incorrect';
        }

        // Update score
        showScore();

        // Show next button
        nextButton.style.display = 'inline-block';

        // Last question
        if (remainingQuestions.length === 0) {
            nextButton.textContent = 'Show Final Score';
        }
    }

    // Display current score
    function showScore() {

        let scoreElement =
            document.getElementById('score');

        if (!scoreElement) {

            scoreElement =
                document.createElement('div');

            scoreElement.id = 'score';
            scoreElement.className = 'score';

            questionContainer.parentNode.insertBefore(
                scoreElement,
                questionContainer
            );
        }

        scoreElement.textContent =
            `Correct answers: ${correctAnswers} / ${answeredQuestions}`;
    }

    // Show final score
    function showFinalScore() {

        questionContainer.innerHTML = `
            <div class="final-score">

                <h2>Quiz Complete!</h2>

                <p>
                    You got
                    <strong>${correctAnswers}</strong>
                    out of
                    <strong>${answeredQuestions}</strong>
                    questions correct.
                </p>

                <button
                    class="next-btn"
                    id="restart-btn">
                    Restart Quiz
                </button>

            </div>
        `;

        document
            .getElementById('restart-btn')
            .addEventListener('click', restartQuiz);
    }

    // Restart current subject
    function restartQuiz() {

        correctAnswers = 0;
        answeredQuestions = 0;

        remainingQuestions = [...questions];

        showScore();
        showRandomQuestion();
    }
});