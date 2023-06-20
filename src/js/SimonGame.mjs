class SimonGame {
    constructor() {
        this.level = 0; // 게임의 단계, 성공 시 마다 1씩 증가한다.
        this.score = 0; // 현재 플레이어의 점수
        this.bestScore = 0; // 플레이어의 최고점수 게임이 끝날때 비교 후 갱신
        this.answerArr = []; // 게임 문제의 정답이 들어가는 배열
        this.time = 3; // 제한시간
        this.speed = 1; // 게임 속도
        this.gameStatus = false; // 게임의 상태를 나타내는 변수
        this.playerArr = []; // 플레이어가 입력한 정답이 들어가는 배열
        this.restart = false; // 게임 재시작을 위한 변수

        this.el = {
            game_buttons: document.querySelector('.game_buttons'),
            buttons: document.querySelectorAll('.game_buttons button'),
            level: document.querySelector('.level span'),
            timer: document.querySelector('.timer'),
            startBtn: document.querySelector('.start_btn'),
            score: document.querySelector('.score span'),
            bestScore: document.querySelector('.best_score span'),
            gameOver: document.querySelector('.game_over'),
            container: document.querySelector('.game_container'),
            collect: document.querySelector('.collect'),
        };

        this.el.startBtn.addEventListener('click', () => { this.start(); });

        this.el.buttons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.playerSubmit(Number(e.target.dataset.number));
            });
            // btn.addEventListener('touchstart', (e) => {
            //     if (!this.playerAnswer) return;
            //     if(event.target.disabled) return;
            //     event.target.classList.add('active');
            // });
            // btn.addEventListener('touchend', (e) => {
            //     event.target.classList.remove('active');
            // });
        });

        this.init(); // 초기화 함수 실행
    }

    init() { // 초기화 함수
        window.localStorage.getItem('bestScore') ? this.bestScore = window.localStorage.getItem('bestScore') : this.bestScore = 0; // 로컬스토리지에 점수가 있으면 가져오고 없으면 0으로 초기화
        this.el.bestScore.textContent = this.bestScore; // 최고점수 표시
        this.el.container.classList.remove('shake'); // 흔들림 효과 제거
        this.level = 0;
        this.score = 0;
        this.time = 3;
        this.speed = 1;
        this.gameStatus = false;
        this.playerAnswer = false;
        this.playerArr = [];
        this.answerArr = [];

        this.el.bestScore.classList.remove('high'); // 최고점수 효과 제거
        this.el.level.textContent = this.level + 1;
        this.el.score.textContent = this.score;
        this.el.bestScore.textContent = this.bestScore;
        this.el.timer.style.width = "0";

        this.el.buttons.forEach((btn) => { // 버튼 비활성화
            btn.disabled = true;
        });
    }

    checkGameStatus() { // 게임 상태 체크 함수
        if (this.gameStatus) { // 게임이 진행중이면
            return true;
        } else { // 게임이 진행중이 아니면
            return false;
        }
    }

    async start() { // 게임 시작 함수
        if (this.restart) { // 게임 재시작이면
            this.init(); // 초기화
            this.restart = false; // 재시작 변수를 false로 변경
        }
        this.el.game_buttons.classList.remove('active');
        this.playerAnswer = false;
        this.el.startBtn.disabled = true;
        this.el.gameOver.classList.remove('active');
        if (this.checkGameStatus()) return; // 게임이 진행중이면 실행하지 않음
        this.gameStatus = true; // 게임 상태를 진행중으로 변경
        this.time = 3 + Math.trunc(this.level / 4); // 제한시간 초기화
        this.createLevel(); // 레벨에 맞는 문제를 생성

        this.el.buttons.forEach((btn) => { // 버튼 비활성화
            btn.disabled = true;
        });

        this.el.timer.style.transition = `none`;
        this.el.timer.style.width = "60%";

        await this.questionStep();

        setTimeout(async () => {
            this.el.game_buttons.classList.add('active');
            this.playerAnswer = true;
            await this.startTimer()
        }, 500) // 제한시간 시작
    }

    async playerSubmit(num) {
        if (!this.playerAnswer) return;
        if (!this.gameStatus) return;
        this.playerArr.push(num);
        if (navigator.vibrate) {
            navigator.vibrate(100); // 안드로이드에서는 진동 기능 사용
        }

        this.el.buttons[num].classList.add('action');

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 100);
        });

        this.el.buttons[num].classList.remove('action');

        this.playerArr[this.playerArr.length - 1] === this.answerArr[this.playerArr.length - 1] ? null : this.gameOver();

        if (this.playerArr.length === this.answerArr.length) {
            this.submitAnswer(this.playerArr);
        }
    }

    questionStep() { // 문제를 출력하는 함수
        return new Promise((resolve, reject) => {
            let i = 0;
            const interval = setInterval(async () => {
                this.el.buttons[this.answerArr[i]].classList.add('action');
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 500 / this.speed);
                });
                this.el.buttons[this.answerArr[i]].classList.remove('action');

                i++;
                if (i >= this.answerArr.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        resolve();
                    }, 500 / this.speed);
                }
            }, 1000 / this.speed);
        });
    }

    createLevel() {
        this.answerArr = []; // 기존 문제 배열 초기화
        this.playerArr = []; // 기존 플레이어 배열 초기화
        for (let i = 0; i < this.level + 1; i++) { // 레벨보다 1 많은 문제를 생성
            this.answerArr.push(Math.trunc(Math.random() * 4)); // 0 ~ 3내의 4가지 숫자를 랜덤으로 생성
        }
    }

    startTimer() {
        if (!this.checkGameStatus()) return; // 게임이 진행중이 아니면 실행하지 않음

        this.el.buttons.forEach((btn) => {
            btn.disabled = false;
        });

        this.el.timer.style.transition = `${this.time}s linear width`;
        this.el.timer.style.width = "0";

        this.timer = setInterval(() => {
            this.time -= 1;
            if (this.time === 0) {
                this.gameOver();
            }
        }, 1000);
    }

    async submitAnswer(arr) { // 정답 제출 함수
        if (!this.checkGameStatus()) return; // 게임이 진행중이 아니면 실행하지 않음
        clearTimeout(this.timer); // 타이머 제거

        console.log(arr)
        console.log(this.answerArr)

        for (let i = 0; i < arr.length; i++) { // 정답 배열의 길이만큼 반복
            if (arr[i] !== this.answerArr[i]) { // 정답 배열의 값이 다르면 오답
                this.gameOver();
                return false;
            }
        }

        this.el.buttons.forEach((btn) => { // 버튼 비활성화
            btn.disabled = true;
        });

        this.level += 1; // 정답이면 레벨 증가
        this.score += (this.level + (this.time * 10)); // 정답이면 레벨 + 남은 시간 x 10 만큼 점수 증가
        this.gameStatus = false; // 게임 상태를 진행중으로 변경
        this.speed += 0.1; // 게임 속도 증가

        this.el.collect.classList.add('active');

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 500);
        });

        this.el.collect.classList.remove('active');

        this.el.level.textContent = this.level + 1; // 레벨 출력
        this.el.score.textContent = this.score; // 점수 출력
        if (this.score > this.bestScore) {
            this.el.bestScore.classList.add('high');
            this.el.bestScore.textContent = this.score;
        } else {
            this.el.bestScore.classList.remove('high');
        }

        this.start(); // 게임 시작
    }

    gameOver() { // 게임오버 함수
        this.restart = true; // 게임 재시작 변수를 true로 변경
        this.el.buttons.forEach((btn) => { // 버튼 비활성화
            btn.disabled = true;
        });
        this.el.container.classList.add('shake');
        if (navigator.vibrate) {
            navigator.vibrate(500);
        }
        this.gameStatus = false; // 게임 상태를 종료로 변경
        clearTimeout(this.timer); // 타이머 초기화
        if (this.score > this.bestScore) { // 최고점수 갱신
            this.bestScore = this.score;;
            this.el.bestScore.textContent = this.bestScore;
            window.localStorage.setItem('bestScore', this.bestScore);
        }

        this.el.timer.style.transition = `none`;
        this.el.timer.style.width = "0";
        this.el.startBtn.disabled = false;
        this.el.gameOver.classList.add('active');
    }
}

export default SimonGame;