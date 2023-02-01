// Definindo referências para elementos da página.
var authForm = document.getElementById('authForm')
var authFormTitle = document.getElementById('authFormTitle')
var register = document.getElementById('register')
var access = document.getElementById('access')
var loading = document.getElementById('loading')
var userContent = document.getElementById('userContent')
var auth = document.getElementById('auth')
var userEmail = document.getElementById('userEmail')
var sendEmailVerificationDiv = document.getElementById('sendEmailVerificationDiv')
var emailVerified = document.getElementById('emailVerified')
var buttonEmailVerification = document.getElementById('buttonEmailVerification')
var passwordReset = document.getElementById('passwordReset')
var userImg = document.getElementById('userImg')
var userName = document.getElementById('userName')
var todoForm = document.getElementById('todoForm')
var todoCount = document.getElementById('todoCount')
var ulTodoList = document.getElementById('ulTodoList')
var search = document.getElementById('search')
var progressFeedback = document.getElementById('progressFeedback')
var progress = document.getElementById('progress')
var playPauseBtn = document.getElementById('playPauseBtn')
var cancelBtn = document.getElementById('cancelBtn')
var submitTodoForm = document.getElementById('submitTodoForm')
var cancelUpdateTodo = document.getElementById('cancelUpdateTodo')


// Alterar o formulário de autenticação para o cadastro de novas contas.
function toggleToRegister() {
    authForm.submitAuthForm.innerHTML = 'Cadastrar conta'
    authFormTitle.innerHTML = 'Insira os dados para se cadastrar'
    hideItem(register)
    hideItem(passwordReset)
    showItem(access)
}

// Alterar o formulário de autenticação para contas já existentes.
function toggleToAccess() {
    authForm.submitAuthForm.innerHTML = 'Acessar'
    authFormTitle.innerHTML = 'Acesse sua conta para continuar'
    hideItem(access)
    showItem(register)
    showItem(passwordReset)
}

function hideItem(item) {
    item.style.display = "none"
}

function showItem(item) {
    item.style.display = "block"
}

// Mostrar conteúdo para usuários autenticados
function showUserContent(user) {
    // console.log('Usuário: ',user)

    if(user.providerData[0].providerId != 'password') {
        emailVerified.innerHTML = 'Autenticação por provedor confiável.'
        hideItem(sendEmailVerificationDiv)
    } else {
        if(user.emailVerified) {
            emailVerified.innerHTML = 'E-mail verificado'
            hideItem(sendEmailVerificationDiv)
        } else {
            emailVerified.innerHTML = 'E-mail não verificado' 
            showItem(sendEmailVerificationDiv)
        }
    }   

    userImg.src = user.photoURL ? user.photoURL : 'img/unknownUser.png'
    userName.innerHTML = user.displayName

    hideItem(auth)
    userEmail.innerHTML = user.email

    getDefaultTodoList()

    // Busca tarefas filtradas somente uma vez com o 'once' -> Realtime DB / 'get' -> Firestore
    search.onkeyup = () => {
        if(search.value != '') {
            var searchText = search.value.toLowerCase()

            dbFirestoreUsers.doc(user.uid).collection('tarefas')
             .orderBy('nameLowerCase')
             .startAt(searchText).endAt(searchText + '\uf8ff')  // Delimita os resultados de pesquisa
             .get().then((datasnap) => {                       // Busca tarefas filtradas somente uma vez com o 'get()'
                fillTodoList(datasnap)
            })
             
            /* Código do Realtime DB: */
            // dbRefUsers.child(user.uid)
            //  .orderByChild('nameLowerCase')  // Ordena tarefas pelo nome da tarefa
            //  .startAt(searchText).endAt(searchText + '\uf8ff')  // Delimita os resultados de pesquisa
            //  .once('value', (dataSnap) => {     // Busca tarefas filtradas somente uma vez com o 'once()'
            //     fillTodoList(dataSnap)
            //  })
        } else {
            getDefaultTodoList()
        }
    }

    showItem(userContent)
}

// Busca tarefas em tempo real com o 'on' -> Realtime DB / 'onSnapshot' -> Firestore
function getDefaultTodoList() {
    dbFirestoreUsers.doc(firebase.auth().currentUser.uid).collection('tarefas').orderBy('nameLowerCase')
     .onSnapshot((snapshot) => {
        fillTodoList(snapshot)
    })

    /* Código do Realtime DB: */
    // dbRefUsers.child(firebase.auth().currentUser.uid).on('value', (dataSnap) => {
    //     fillTodoList(dataSnap)
    // })
}

function showAuth() {
    hideItem(userContent)
    showItem(auth)
}

// Centralizar e traduzir erros:
function showError(prefix, error) {
    console.log(error.code)
    hideItem(loading)
    switch(error.code) {
        case 'auth/invalid-email':
        case 'auth/wrong-password':
            alert(`${prefix} E-mail ou senha inválidos`)
            break;
        case 'auth/weak-password':
            alert(`${prefix} Senha deve conter ao menos 6 caracteres`)
            break;
        case 'auth/email-already-in-use':
            alert(`${prefix} Este e-mail já está em uso. Escolha outro`)
            break;
        default: 
            alert(`${prefix} ${error.message}`)
    }
}

// Atributos extras de configuração de E-mail (esse objeto que vai fazer com que conseguiremos navegar até a nossa página a partir de um botão no e-mail de confirmação. Você deve inserir esse objeto dentro da função 'sendEmailVerification')
var actionCodeSettings = {
    url: 'http://todolist-fdb68.firebaseapp.com'
}


