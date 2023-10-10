import CourseModel from '../models/course.js';
import Repository from '../models/repository.js';
import Controller from './Controller.js';
import path from 'path';
import fs from 'fs';

export default class MathsController extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new CourseModel()));
        this.params = HttpContext.path.params;
    }
    doOperation(){
        let result;
        let x = parseFloat(this.params.x);
        let y = parseFloat(this.params.y);
        let n = parseFloat(this.params.n);
        console.log("1 + " + JSON.stringify(this.params))
        if("op" in this.params){
            switch (this.params.op){
                case "/":
                    result = this.division(x, y);
                    break;
                case " ":
                    result = this.addition(x, y);
                    break;
                case "-":
                    result = this.substraction(x, y);
                    break;
                case "%":
                    result = this.modulo(x, y);
                    break;
                case "*":
                    result = this.multiply(x, this.params.y);
                    break;
            }
        }
        console.log(result);
        this.params.value = result;
        this.HttpContext.response.end(JSON.stringify(this.params))
    }
    startOperation() {
        const nCalc = ['!', 'p', 'np'];
        const xyCalc = [' ', '+', '-', '/', '*', '%'];
        const xyParams = ['op', 'x', 'y'];
        const nParams = ['op', 'n'];
        const refusedParams = [];
        let result;
        let nIsPositive = this.params.n > 0;
        let nIsInteger = Number.isInteger(parseFloat(this.params.n));


        for (const param in this.params) {
            if (
                (xyCalc.includes(this.params.op) && !xyParams.includes(param)) ||
                (nCalc.includes(this.params.op) && !nParams.includes(param))
            ) refusedParams.push(param);
        }

        if (refusedParams.length > 0) {
            this.params.error = 'too many peremeters';
        }

        if (!this.params.error && !xyCalc.includes(this.params.op) && !nCalc.includes(this.params.op)) {
            this.params.error = "parameter is missing";
        }

        else { //if params are correct
            if (xyCalc.includes(this.params.op)) { //if it's an xy operation
                if (!isNaN(this.params.x) && !isNaN(this.params.y)) { //if x and y are numbers
                    let x = parseFloat(this.params.x);
                    let y = parseFloat(this.params.y);
                    if("op" in this.params){
                        switch (this.params.op){
                            case "/":
                                result = this.division(x, y);
                                break;
                            case " ":
                                this.params.op = "+";
                                result = this.addition(x, y);
                                break;
                            case "-":
                                result = this.substraction(x, y);
                                break;
                            case "%":
                                result = this.modulo(x, y);
                                break;
                            case "*":
                                result = this.multiply(x, this.params.y);
                                break;
                        }
                    }
                } else { //if x and/or y are not numbers
                    if(isNaN(this.params.x)) this.params.error = 'x is not a number';
                    if(isNaN(this.params.y)) this.params.error = 'y is not a number';
                }
            }

            if (nCalc.includes(this.params.op)) { //if it's an n operation
                if (!isNaN(this.params.n) && nIsPositive && nIsInteger) { //if n is a number
                    let n = parseInt(this.params.n);
                    if("op" in this.params){
                        switch (this.params.op){
                            case "!":
                                result = this.factorial(n);
                                break; 
                            case "np":
                                result = this.findNthPrime(n);
                                break;
                            case "p":
                                result = this.isPrime(n);
                                break;
                        }
                    }
                } else{ //if n is not a number
                    if(!nIsPositive){
                        this.params.error = 'n is not positive';
                    }
                    else if(!nIsInteger){
                        this.params.error = 'n is not an integer';
                    }
                    else{
                        this.params.error = 'n is not a number';
                    }
                }
            }
        }
        
        if (!this.params.error) {
            this.params.value = result;
        }
        this.HttpContext.response.end(JSON.stringify(this.params));
    }
    factorial(n) {
        if (n === 0 || n === 1) {
            return 1;
        }
        return n * this.factorial(n - 1);
    }
    isPrime(n) {
        if (n <= 1) {
            return false;
        }
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) {
                return false;
            }
        }
        return true;
    }
    findNthPrime(n) {
        let count = 0;
        let num = 2;
        while (count < n) {
            if (this.isPrime(num)) {
                count++;
            }
            num++;
        }
        return num - 1;
    }
    division(x, y){
        if(x === 0 && y === 0) return "NaN";

        if(x === 0 || y === 0) return "Infinity";

        return x / y;
    }
    multiply(x, y){
        return x * y;
    }
    modulo(x, y){
        if (x === 0) return "NaN";
        else if(y === 0) return "NaN";
        else return x % y;
    }
    substraction(x, y){
        return x - y;
    }
    addition(x, y){
        return x + y;
    }
    help() {
    let helpPagePath = path.join(process.cwd(), wwwroot, 'API-Help-Pages/API-Maths-Help.html');
    this.HttpContext.response.HTML(fs.readFileSync(helpPagePath));
    }
    get() {
        if(this.HttpContext.path.queryString == '?')
            this.help();
        else
            this.startOperation();
    }
    
}

