
/**
 * Class Domain manipulations
 *
 */
export class Domain {

    private clauses: Array<Clause>;

    
    constructor(domain:Array<any>) {
        this.clauses = new Array<Clause>();

        /*
            supported formats : 
            1) empty  domain : []
            2) 1 condition only : [ '{operand}', '{operator}', '{value}' ]
            3) 1 clause only (one or more conditions) : [ [ '{operand}', '{operator}', '{value}' ], [ '{operand}', '{operator}', '{value}' ] ]
            4) mutiple clauses : [ [ [ '{operand}', '{operator}', '{value}' ], [ '{operand}', '{operator}', '{value}' ] ], [ [ '{operand}', '{operator}', '{value}' ] ] ]
        */    
        domain = this.normalize(domain);

        for(let d_clause of domain) {
            let clause = new Clause();
            for(let d_condition of d_clause) {
                clause.addCondition(new Condition(d_condition[0], d_condition[1], d_condition[2]))
            }
            this.addClause(clause);
        }

    }

    private normalize(domain: Array<any>) {
        if(domain.length <= 0) {
            return [];
        }

        if(!Array.isArray(domain[0])) {
            // single condition
            return [[domain]];
        }
        else {
            if( domain[0].length <= 0)  {
                return [];
            }            
            if(!Array.isArray(domain[0][0])) {
                // single clause
                return [domain];
            }
        }
        return domain;        
    }
    
    public addClause(clause: Clause) {    
        this.clauses.push(clause);
    }
    
    public addCondition(condition: Condition) {
        for(let clause of this.clauses) {
            clause.addCondition(condition);
        }

    }

    public evaluate(values: any) {
        let res = false;
        for(let clause of this.clauses) {
            let c_res = true;
            for(let condition of clause.getConditions()) {

                if(!values.hasOwnProperty(condition.operand)) {
                    continue;
                }

                let operand = values[condition.operand];
                let operator = condition.operator;
                let value = condition.value;

                let cc_res: boolean;
                
                // handle special cases
                if(operator == '=') {
                    operator = '==';
                }
                else if(operator == '<>') {
                    operator = '!=';
                }

                if(operator == 'in') {
                    if(!Array.isArray(value)) {
                        continue;
                    }
                    cc_res = (value.indexOf(operand) > -1);
                }
                else {
                    let c_condition = "( '" + operand + "' "+operator+" '" + value + "')";
                    cc_res = <boolean>eval(c_condition);
                }                
                c_res = c_res && cc_res;
            }
            res = res || c_res;
        }
        return res;
    }

}

class Clause {
    private conditions: Array<Condition>;

    constructor() {
        this.conditions = new Array<Condition>();
    }

    public addCondition(condition: Condition) {
        this.conditions.push(condition);

    }

    public getConditions() {
        return this.conditions;
    }
}

class Condition {
    public operand:any;
    public operator:any;
    public value:any;

    constructor(operand: any, operator: any, value: any) {
        this.operand = operand;
        this.operator = operator;
        this.value = value;
    }
}
export default Domain;