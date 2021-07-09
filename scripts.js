const Modal = {
    open() {
        //Abrir modal
        //Adicional a class active ao modal
        //DOM - document obejct model (document)
        //o DOM é um modelo de toda estrutura html passada para o JS.
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
        //Pesquisa dentro do 'document' linha por linha, e devolve um objeto, usando 'querySelector' (pesquisar um seletor) que tem como parametro a classe que procuro 'modal-overlay'.
    },
    close() {
        //Fechar o modal
        //remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
        //'stringify' transforma em 'string'
    } 
}

const Transaction = {
    all: Storage.get(),
    //cria um atalho das 'transactions', dentro deste objeto
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        //remove pela posição no array
        //o primeiro argumento é a posição no array do que quero remover
        //o segundo argumento é a quantidade que desejo deletar do array
        App.reload()
    },

    incomes() {
        let income = 0;
        //pegar todas as transações
        //para cada transação
        Transaction.all.forEach(transaction => {
            //se for maior que zero
            if (transaction.amount > 0) {
                //somar a uma variável e retornar a variável
                income += transaction.amount;
            }
        })

        return income;
    },
    expenses() {
        let expense = 0;
        //pegar todas as transações
        //para cada transação
        Transaction.all.forEach(transaction => {
            //se for menor que zero
            if (transaction.amount < 0) {
                //somar a uma variável e retornar a variável
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total() {
        //O total é a entrada menos a saída


        return Transaction.incomes() + Transaction.expenses()
        //Foi usado '+' pois já existe sinal de negativo nas expenses, logo '+' com '-' é '+'
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclasses = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclasses}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        //caso não funcione, 2º opção =  Number(value.replace(/\,\./g, ""))
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        //'split' divie a string, passando o separador como parâmetro
        return `${splittedDate[2]}/ ${splittedDate[1]}/ ${splittedDate[0]}`
        //retorna as três 'string' separadas pelo 'split', cada uma numa posição no 'array'.
        //A data foi ordenada da maneira correta, na hora de retornar 'dia/mês/ano'.
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")
        //O 'g' faz a pesquisa global na string
        //O '\D' acha tudo que não é número
        // O '//' é chamado de expressão regular

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),


    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()// Desistruturação
        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            //'trim()' faz uma limpeza de espaços fazios.
            throw new Error("Por favor, preencha todos os campos!")
            //'new Error' função construtora que retorna uma mensagem
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description, 
            //no 'JS' quando quando o nome da chave tem o mesmo nome da variável é possível usar esse 'shorthand'
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        // evitar que o comportamento padrão seja feito, que é enviar o formulário com varias infos.

        try {
            //verificar se todas as informações foram preenchidas
            Form.validateFields()

            //formatar os dados para salvar
            const transaction = Form.formatValues()

            //salvar
            Transaction.add(transaction)

            //apagar os dados do formulário
            Form.clearFields()

            //modal feche
            Modal.close()

        } catch (error) {
            alert(error.message)
        }


    }
}

const App = {
    init() {

        Transaction.all.forEach(DOM.addTransaction())

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

