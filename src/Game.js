import React, { Component } from 'react';
import SelectLevel from './SelectLevel'
import { EASY, MEDIUM, HARD} from './const'

const SIZE = 9
const KEY = "sudoku-status"
const SQRT = Math.sqrt(SIZE)

export default class Sudoku extends Component {
    constructor(props) {
        super(props)
        this.state = {
            arr: null,
            originalArr: null,
            highlight: null,
            selectedSlot: null,
            startTime:null,
            level:EASY
        }
    }

    errorCells = []

    initArr(){
        let arr = new Array(SIZE)
        for (let i = 0; i < SIZE; i++) {
            arr[i] = new Array(SIZE)
        }
        return arr
    }

    componentDidMount() {
        if(!this.restoreGame()) this.initGame(EASY)
    }

    saveGame(){
        let usedTime = this.computeUsedTime()
        let state = {
            ...this.state,
            usedTime
        }
        localStorage.setItem(KEY, JSON.stringify(state))
    }

    clearSavedStatus(){
        localStorage.removeItem(KEY)
    }

    restoreGame(){
        let state = JSON.parse(localStorage.getItem(KEY))
        if(state){
            state.startTime = Date.now() - state.usedTime * 1000
            state.usedTime = null
            state.errorCells = []
            this.setState({
                ...state
            })
            return true
        }
        return false
    }

    initGame(mode){
        this.clearSavedStatus()
        this.arr = this.initArr()
        this.fillValues()
        this.fillRemaining(0, SQRT)
        this.emptyCells(mode);
        this.setState({
            arr: this.arr,
            originalArr: this.deepClone(this.arr),
            highlight:null,
            selectedSlot:null,
            startTime:null,
            level:mode,
            errorCells:[]
        }, () => {
            document.querySelectorAll(".cell-input").forEach((elem) => {
                elem.classList.add("animated")
                elem.classList.add("fadeIn")
             })
            setTimeout(() => {
                document.querySelectorAll(".animated").forEach((elem) => {
                    elem.classList.remove("animated")
                    elem.classList.remove("fadeIn")
                 })
            },1000)
        })
    }

    deepClone(arr) {
        let tmp = []
        arr.forEach(ar => tmp.push([...ar]))
        return tmp
    }

    emptyCells(mode) {
        let count,
            arr = this.arr,
            stop

        switch(mode){
            case EASY:
                count = 20;
                break;
            case MEDIUM:
                count = 40;
                break;
            case HARD:
                count = 60;
                break;
            default:
                count = 20;
        }
        stop = count % SIZE
        //First remove from each box
        let x = this.generateRandomNumber(SQRT) - 1, y = this.generateRandomNumber(SQRT) - 1
        while (count > stop) {
            for (let i = 0; i < SIZE; i += SQRT) {
                for (let j = 0; j < SIZE; j += SQRT) {
                    do {
                        x = this.generateRandomNumber(SQRT) - 1, y = this.generateRandomNumber(SQRT) - 1
                    } while (!arr[i + x][j + y])
                    arr[i + x][j + y] = ""
                    count--
                }
            }
        }

        for (let i = 0; i < count; i++) {
            let random = this.generateRandomNumber(SIZE * SIZE)
            let row = Math.floor(random / SIZE), col = random % SIZE
            if (row != 0) row--
            arr[row][col] = ""
        }
        this.setState({ arr })
    }

    fillValues() {
        this.fillDiagonal();
    }

    fillRemaining(i, j) {
        if (j >= SIZE && i < SIZE - 1) {
            j = 0
            i++
        }
        if (i >= SIZE && j >= SIZE) return true
        if (i < SQRT) {
            //skip first box
            if (j < SQRT) j = SQRT
        } else if (i + SQRT < SIZE) {
            //skip middle filled boxes
            if (j == Math.floor(i / SQRT) * SQRT) j += SQRT
        } else {
            //skip last box
            if (j == SIZE - SQRT) {
                i++
                j = 0
                if (i >= SIZE) return true
            }
        }

        for (let num = 1; num <= SIZE; num++) {
            if (this.isSafe(i, j, num)) {
                this.arr[i][j] = num
                if (this.fillRemaining(i, j + 1)) return true
                this.arr[i][j] = ""
            }
        }
        return false
    }

    fillDiagonal() {
        for (let i = 0; i < SIZE; i += SQRT) {
            this.fillBox(i, i)
        }
    }

    fillBox(row, col) {
        let val
        for (let i = 0; i < SQRT; i++) {
            for (let j = 0; j < SQRT; j++) {
                do {
                    val = this.generateRandomNumber()
                }
                while (!this.notUsedInBox(row, col, val))
                this.arr[row + i][col + j] = val
            }
        }
    }

    generateRandomNumber(size = SIZE) {
        return Math.floor(Math.random() * size + 1)
    }

    isValidSudoku(arr) {
        let colMap = generate(), rowMap = generate(), diagMap = generate()
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (!arr[i][j]) return false
                let val = arr[i][j]
                if (colMap[j][val - 1] || rowMap[i][val - 1] || diagMap[SQRT * Math.floor(i / SQRT) + Math.floor(j / SQRT)][val - 1]) {
                    return false
                }
                colMap[j][val - 1] = true
                rowMap[i][val - 1] = true
                diagMap[SQRT * Math.floor(i / SQRT) + Math.floor(j / SQRT)][val - 1] = true
            }
        }
        return true

        function generate() {
            let arr = new Array(SIZE)
            for (let i = 0; i < SIZE; i++) {
                arr[i] = new Array(SIZE).fill(false)
            }
            return arr
        }
    }

    isSafe(row, col, val) {
        return (
            this.notUsedInCol(col, val) &&
            this.notUsedInRow(row, val) &&
            this.notUsedInBox(row - row % SQRT, col - col % SQRT, val)
        )
    }

    chooseLevel = (level) => {
        if(this.state.startTime){
            window.swal({
                title:"Are you sure?",
                text:"You will lose current progress",
                type:"warning",
                showCancelButton:true,
                confirmButtonText:"Yes"
            }).then((res) => {
                if(res.value) this.initGame(level)
            })
        } else this.initGame(level);
    }

    getLevel = (level) => {
        switch(level){
            case EASY: return 'Easy';
            case MEDIUM: return 'Medium';
            case HARD: return 'Hard';
            default: return 'Easy'
        }
    }

    notUsedInRow(row, val) {
        for (let j = 0; j < SIZE; j++) {
            if (this.arr[row][j] == val) return false
        }
        return true
    }

    notUsedInCol(col, val) {
        for (let i = 0; i < SIZE; i++) {
            if (this.arr[i][col] == val) return false
        }
        return true
    }

    notUsedInBox(row, col, val) {
        for (let i = 0; i < SQRT; i++) {
            for (let j = 0; j < SQRT; j++) {
                if (this.arr[row + i][col + j] == val) return false
            }
        }
        return true
    }

    checkErrorAndWin = (x,y,val) => {
        if(this.checkError(x,y,val)) {
            let tmp = this.deepClone(this.state.arr)
            tmp[x][y] = ""
            window.setTimeout(() => this.setState({arr: tmp, errorCells:[]}),500)
        }
        else this.checkWin()
    }
    //When player type on input
    handleChange = (e) => {
        let val = e.target.value
        if (val != "" && !/[0-9]/.test(val)) return false
        this.startTimer()
        let parent = e.target.parentElement
        let data = parent.dataset
        let x = +data.x, y = +data.y
        let arr = this.deepClone(this.state.arr)
        arr[x][y] = val
        this.setState({ arr },() => {
            this.checkErrorAndWin(x,y,val)
        })
    }

    //Show obvious error move
    checkError = (x,y,val) => {
        let arr = [], mat = this.state.arr
        if(!val) return this.setState({errorCells:[]})
        //Check col
        for(let i = 0; i < SIZE; i++){
            if(mat[i][y] == val && i != x) arr.push([i,y])
        }
        //Check row
        for(let j = 0; j < SIZE; j++){
            if(mat[x][j] == val && j != y) arr.push([x,j])
        }
        //Check box
        let i = Math.floor(x/SQRT) * SQRT, j = Math.floor(y/SQRT) * SQRT
        for(let a = 0; a < SQRT; a++){
            for(let b = 0; b < SQRT; b++){
                if(mat[i + a][j + b] == val && (i + a) != x && (j + b) != y) arr.push([i+a,j+b])
            }
        }
        if(arr.length > 0) arr.push([x,y])
        this.setState({
            errorCells:arr
        })
        return arr.length > 0;
    }

    //Is error related cells
    isErrorCells = (i, j) => {
        for(let k = 0; k < this.state.errorCells.length; k++){
            let coor = this.state.errorCells[k]
            if(coor[0] == i && coor[1] == j) return true
        }
        return false
    }
    //Start tracking play time
    startTimer = () => {
        if(!this.state.startTime) {
            this.setState({ startTime: Date.now()})
        }
    }

    computeUsedTime = () => {
        if(!this.state.startTime) return 0
        return ((Date.now() - this.state.startTime)/1000).toFixed(1)
    }

    checkWin = () => {
        this.saveGame()
        let res = this.isValidSudoku(this.state.arr)
        if (res) {
            let timeUsed = this.computeUsedTime()
            //setTimeout(() => alert("Congratulations!"))
            window.swal("You Win!", `<ul>
                <li>Time used: ${timeUsed} seconds</li>
            </ul>`, "success").then(() => this.initGame(EASY))
        }
    }

    //Is cell prefilled with value
    isPrefilledCell = (x, y) => {
        return !!this.state.originalArr[x][y]
    }

    //When player click on cell. High light same number
    highlightNumber = (e) => {
        let div = e.target.parentElement
        let x = +div.dataset.x, y = +div.dataset.y
        let isSlot = e.target.classList.contains("slot")
        if(window.screen.width <= 600) e.target.blur()
        let num = this.state.arr[x][y]
        if (isSlot) {
            this.setState({
                highlight: num,
                selectedSlot: [x, y]
            })
        } else {
            this.setState({ highlight: num, selectedSlot: null })
        }
    }

    //Mobile fill val
    fillVal = (e) => {
        let val = e.target.dataset.num, slot = this.state.selectedSlot
        if (slot) {
            this.startTimer()
            let arr = this.deepClone(this.state.arr)
            arr[slot[0]][slot[1]] = val
            this.setState({ arr }, () => this.checkErrorAndWin(slot[0], slot[1], val))
        }
    }

    isSelectedSlot = (i,j) => {
        let slot = this.state.selectedSlot
        if(!slot) return false
        return slot[0] == i && slot[1] == j
    }

    render() {
        if(!this.state.arr) return <div>Initializing...</div>
        return (
            <main>
                <header className="App-header">
                    <h1 className="App-title">Sudoku</h1>
                    <small>{ this.getLevel(this.state.level) }</small>
                </header>
                <SelectLevel onSelect={this.chooseLevel} />
                <div className="wrapper">
                    <div className="board">
                        {this.state.arr.map((row, i) => (
                            row.map((cell, j) => (
                                <div className="cell" data-x={i} data-y={j} key={j}>
                                    <input type="text" value={cell} className={"cell-input " + (this.isErrorCells(i,j)?"error":"") +  (this.isPrefilledCell(i, j) ? "" : "slot") + (this.isSelectedSlot(i,j)?" active":"" )} readOnly={this.isPrefilledCell(i, j)}
                                        style={
                                            { color: this.state.highlight == this.state.arr[i][j] ? "red" : "" }
                                        }
                                        maxLength="1"
                                        onChange={this.handleChange} value={this.state.arr[i][j]} onClick={this.highlightNumber} />
                                </div>
                            )
                            )
                        ))}
                    </div>
                    <div className="buttons">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val, i) => (
                            <button key={i} className="num-button"
                                data-num={val}
                                onClick={this.fillVal}>{val} </button>
                        ))}
                    </div>
                </div>
            </main>

        )
    }
}