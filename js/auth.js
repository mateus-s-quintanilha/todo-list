// Traduz para português a autenticação do firebase (ex: envio de e-mails)
firebase.auth().languageCode = 'pt-BR'

// Função que trata da submissão do formulário de autenticação
authForm.onsubmit = function (event) {
    showItem(loading)
    event.preventDefault()
    if(authForm.submitAuthForm.innerHTML == 'Acessar') {
        firebase.auth().signInWithEmailAndPassword(authForm.email.value, authForm.password.value)
            // .then((user) => {
            //     console.log('Acessou com sucesso!')
            //     console.log(user)
            //     authForm.reset()
            // })
            .catch((err) => {
                showError('Falha no acesso: ', err)
            })
    } else {
        firebase.auth().createUserWithEmailAndPassword(authForm.email.value, authForm.password.value) 
            // .then((newUser) => {
            //     console.log('Cadastrado realizado com sucesso!')
            //     console.log(newUser)
            //     authForm.reset()
            // })
            .catch((err) => {
                showError('Falha no cadastro: ', err)
            }) 
    }
}

// Função que centraliza e trata a autenticação
firebase.auth().onAuthStateChanged((user) => {
    hideItem(loading)
    if(user) {
        console.log('Usuário autenticado!')
        // console.log(user)
        showUserContent(user)
    } else {
        console.log('Usuário não autenticado.')
    }
})

// Função que desloga da conta
function signOut() {
    firebase.auth().signOut()
        .then(() => {
            alert('Usuário deslogado')
            showAuth()
            authForm.reset()
        })
        .catch((err) => {
            alert('erro ao deslogar')
            console.log(err)
        }) 
}

// Função que faz a verificação do email dele
function sendEmailVerification() {
    showItem(loading)
    var user = firebase.auth().currentUser
    user.sendEmailVerification(actionCodeSettings)
        .then(() => {
            alert('E-mail de verificação foi enviado para ' + user.email)
        })
        .catch((err) => {
            alert('Houve um erro ao enviar o e-mail de verificação')
            console.log(err)
        })
        .finally(() => {
            hideItem(loading)
        }) 
}

function sendPasswordResetEmail() {
    var email = prompt('Informe abaixo o E-mail utilizado na sua conta:', authForm.email.value)
    showItem(loading)

    if(email) {
        firebase.auth().sendPasswordResetEmail(email, actionCodeSettings)
            .then(() => {
                alert('E-mail enviado com sucesso para ' + email)
            })
            .catch((err) => {
                alert('Erro ao enviar E-mail de redefinição de senha.')
                console.log(err)
            })
            .finally(() => {
                hideItem(loading)
            })
    } else {
        alert('Por favor informe um E-mail')
        hideItem(loading)
    }
}


function signInWithGoogle() {
    showItem(loading)
                //    .signInWithRedirect -> coloque isso no lugar do debaixo para em vez de abrir uma popup, ele redirecionar a página para o login no Google
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch((err) => {
            alert('Houve um erro ao autenticar usando o Google')
            console.log(err)
            hideItem(loading)
        })
}

function signInWithGitHub() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider())
        .catch((err) => {
            alert('Houve um erro ao autenticar usando o GitHub')
            console.log(err)
            hideItem(loading)
        })
}

function signInWithFacebook() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .catch((err) => {
            alert('Houve um erro ao autenticar usando o Facebook')
            console.log(err)
            hideItem(loading)
        })
}

function updateUserName() {
    var newUserName = prompt('Informe como deseja ser chamado: ', userName.innerHTML)
    var userAtual = firebase.auth().currentUser
    if(newUserName && newUserName != '') {
        userName.innerHTML = newUserName
        firebase.auth().userAtual.updateProfile({
            displayName: newUserName
        }).catch((err) => {
            alert('Erro ao atualizar o nome de usuário')
            console.log(err)
        })
    } else {
        alert('ERRO: o nome de usuário não pode ser vazio')
    }
}

function deleteUserAccount() {
    var confirmation = confirm('Deseja mesmo excluir sua conta?')
    var currentUser = firebase.auth().currentUser
    if(confirmation) {
        firebase.auth().currentUser.delete().then(() => {
            alert('Conta removida com sucesso.')
        }).catch((err) => {
            alert('Erro ao deletar a sua conta.')
            console.log(err)
        })
    }
}