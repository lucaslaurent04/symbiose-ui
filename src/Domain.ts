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
            4) multiple clauses : [ [ [ '{operand}', '{operator}', '{value}' ], [ '{operand}', '{operator}', '{value}' ] ], [ [ '{operand}', '{operator}', '{value}' ] ] ]
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

    public toArray() {
        let domain = new Array();
        for(let clause of this.clauses) {
            domain.push(clause.toArray());
        }
        return domain;
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

    /**
     * Update domain by parsing conditions and replace any occurence of `object.` and `user.` notations with related attributes of given objects.
     * 
     * @param values
     * @returns Domain  Returns current instance with updated values.
     */
    public parse(object: any, user: any = {}) {
        for(let clause of this.clauses) {
            for(let condition of clause.conditions) {

                if(!object.hasOwnProperty(condition.operand)) {
                    continue;
                }

                let value = condition.value;

                // handle object references as `value` part 
                if(value.indexOf('object.')) {
                    let target = value.substring('object.'.length);
                    if(!object.hasOwnProperty(target)) {
                        continue;
                    }
                    value = object[target];    
                }
                // handle user references as `value` part 
                else if(value.indexOf('user.')) {
                    let target = value.substring('user.'.length);
                    if(!user.hasOwnProperty(target)) {
                        continue;
                    }
                    value = user[target];    
                }

                condition.value = value;
            }
        }
        return this;
    }

    /**
     * Evaluate domain for a given object.
     * Object structure has to comply with the operands mentionned in the conditions of the domain. If no, related conditions are ignored (skipped).
     * 
     * @param object 
     * @returns boolean Return true if the object matches the domain, false otherwise.
     */
    public evaluate(object: any) : boolean {
        let res = false;
        // parse any reference to object in conditions
        this.parse(object);
        // evaluate clauses (OR) and conditions (AND)
        for(let clause of this.clauses) {
            let c_res = true;
            for(let condition of clause.getConditions()) {

                if(!object.hasOwnProperty(condition.operand)) {
                    continue;
                }

                let operand = object[condition.operand];
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
    public conditions: Array<Condition>;

    constructor() {
        this.conditions = new Array<Condition>();
    }

    public addCondition(condition: Condition) {
        this.conditions.push(condition);

    }

    public getConditions() {
        return this.conditions;
    }

    public toArray() {
        let clause = new Array();
        for(let condition of this.conditions) {
            clause.push(condition.toArray());
        }
        return clause;
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

    public toArray() {
        let condition = new Array();
        condition.push(this.operand);
        condition.push(this.operator);
        condition.push(this.value);
        return condition;
    }
}
export default Domain;