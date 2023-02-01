
// Referência ao Realtime Database:
var database = firebase.database();
var dbRefUsers = database.ref('users')

// Referência ao Firestore:
var dbFirestoreUsers = firebase.firestore().collection('users')

// Trata a submissão do formulário de tarefas
todoForm.onsubmit = function (event) {
    event.preventDefault()

    if (todoForm.name.value != '') {
        var file = todoForm.file.files[0]   // Seleciona o 1º arquivo da seleção de arquivos
        if (file != null) {
            if (file.type.includes('image')) {  // Verifica se o arquivo é uma imagem

                if(file.size > 1024 * 1024 * 2) {
                    alert(`A imagem não pode ser maior do que 2MB. A imagem selecionada tem ${(file.size / 1024 / 1024).toFixed(2)}MB.`)
                    return  // Esse 'return' ignora o resto do código e sai do 'if'.
                }

                // Compõe o nome do arquivo
                var imgName = firebase.database().ref().push().key + '-' + file.name
                // Compõe o caminho do arquivo
                var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName

                // Cria uma referência de arquivo usando o caminho criado anteriormente 
                var storageRef = firebase.storage().ref(imgPath)
                // Inicia o processo de upload
                var upload = storageRef.put(file)

                trackUpload(upload).then(() => {
                    storageRef.getDownloadURL().then((downloadUrl) => {
                        var data = {
                            imgUrl: downloadUrl,
                            name: todoForm.name.value,
                            nameLowerCase: todoForm.name.value.toLowerCase()
                        }

                        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('tarefas').add(data).then(() => {
                            console.log('Submissão feita com sucess')
                            todoForm.reset()
                        }).catch((err) => {
                            console.log('Erro ao realizar submissão: ', err)
                        })

                        /* Código do Realtime DB: */
                        // dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(() => {
                        //     console.log('Submissão feita com sucesso!')
                        //     todoForm.reset()
                        // }).catch((err) => {
                        //     alert('Ocorreu um erro ao adicionar a tarefa ao banco de dados. (use no máximo 30 caracteres)')
                        //     console.log(err)
                        // })
                    })
                }).catch((err) => {
                    showError('Ocorreu um erro ao adicionar a tarefa ao banco de dados:', err)
                })
            } else {
                alert('O arquivo selecionado precisa ser uma imagem.')
            }
        } else {
            var data = {
                name: todoForm.name.value,
                nameLowerCase: todoForm.name.value.toLowerCase()
            }

            /* Utilizando o Firestore: */
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('tarefas').add(data)
             .then(() => {
                console.log('Submissão feita com sucess')
                todoForm.reset()
             }).catch((err) => {
                console.log('Erro ao realizar submissão: ', err)
            })

            /* Código do Realtime DB: */
            // dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(() => {
            //     console.log('Submissão feita com sucesso!')
            //     todoForm.reset()
            // })
        }
    } else {
        alert('Formulário não pode estar vazio')
    }
}

function trackUpload(upload) {
    return new Promise((resolve, reject) => {

        showItem(progressFeedback)
        upload.on('state_changed',
            (snapshot) => {     // Segundo argument o: recebe informações sobre o upload
                progress.value = snapshot.bytesTransferred / snapshot.totalBytes * 100
            },
            (error) => {        // Terceiro argumento: função executada no caso de erro no upload
                showError('Houve uma falha no upload', error)
                hideItem(progressFeedback)
                reject()
            },
            () => {       // Quarto argumento: função executada no caso de sucesso no upload
                console.log('Houve sucesso no upload!')
                hideItem(progressFeedback)
                resolve()
            })

        var playPauseUpload = true  // Estado de controle do nosso upload (pode estar pausado ou em andamento)

        playPauseBtn.onclick = (event) => {
            event.preventDefault()
            playPauseUpload = !playPauseUpload  // Inverte o estado de controle do nosso upload
            if (playPauseUpload) {
                upload.resume() // Retoma o upload

                playPauseBtn.innerHTML = 'Pausar'
                console.log('upload retomado!')
            } else {
                upload.pause()  // Pausa o upload

                playPauseBtn.innerHTML = 'Continuar'
                console.log('Upload Pausado')
            }
        }

        cancelBtn.onclick = (event) => {
            event.preventDefault()
            upload.cancel()   // Cancela o upload
            alert('Upload cancelado pelo usuário')
            hideItem(progressFeedback)
        }
    })
}

// Exibe a lista de tarefas do usuário: 
function fillTodoList(dataSnapshot) {
    ulTodoList.innerHTML = ''

    var num = dataSnapshot.size
    // var num = dataSnapshot.numChildren()  -> Código do Realtime DB

    todoCount.innerHTML = `${num} ${(num > 1 ? 'Tarefas' : 'Tarefa')}:`

    dataSnapshot.forEach((item) => {
        
        var value = item.data()
        // var value = item.val() -> Código do Realtime DB

        var li = document.createElement('li')
        var imgLi = document.createElement('img')
        var spanLi = document.createElement('span')
        var liRemoveBtn = document.createElement('button')
        console.log('value: ', value)

        li.id = item.id     // Aqui atribuimos o id do 'item' ('id') ao li que vai envolver esse 'item', com isso será mais fácil pegar referências dos elementos que estão dentro do 'li'.
        // li.id = item.key -> Código do Realtime DB    // Aqui atribuimos o id do 'item' ('key') ao li que vai envolver esse 'item', com isso será mais fácil pegar referências dos elementos que estão dentro do 'li'.

        imgLi.src = value.imgUrl ? value.imgUrl : 'img/defaultTodo.png'
        imgLi.setAttribute('class', 'imgTodo')


        liRemoveBtn.appendChild(document.createTextNode('Deletar'))
        liRemoveBtn.setAttribute('onclick', `removeTodo('${item.id}')`)
        liRemoveBtn.setAttribute('class', 'danger todoBtn')

        var liUpdateBtn = document.createElement('button')
        liUpdateBtn.appendChild(document.createTextNode('Atualizar'))
        liUpdateBtn.setAttribute('onclick', `updateTodo('${item.id}')`)
        liUpdateBtn.setAttribute('class', 'alternative todoBtn')

        spanLi.appendChild(document.createTextNode(value.name))    // Adiciona um elemento de texto dentro da span

        li.appendChild(imgLi)
        li.appendChild(spanLi)
        li.appendChild(liRemoveBtn)
        li.appendChild(liUpdateBtn)

        ulTodoList.appendChild(li)
    })
}

// Remove tarefas
function removeTodo(key) {
    console.log('key chegando no removeTodo: ', key)
    var todoImg = document.querySelector(`#${key} > img`)   // Atribuimos na função acima o id do 'item' ao 'li' que o envolve, com isso pegamos o elemento img que está dentro do 'li'.
    console.log(todoImg)
    var confirmation = confirm('Realmente deseja remover a tarefa?')
    if (confirmation) {

        dbFirestoreUsers.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(key).delete()
         .then(() => {
            alert('Tarefa removida com sucesso!')
            removeFile(todoImg.src)
         }).catch((err) => {
            showError('Falha ao remover tarefa: ', err)
        })

        /* Código do Realtime DB: */
        // dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove()
        //  .then(() => {
        //     alert('Tarefa removida com sucesso')
        //     removeFile(todoImg.src)
        //  })
        //  .catch((err) => {
        //     showError('Falha ao remover tarefa: ' + err)
        //  })
    }
}

function removeFile(imgUrl) {
    console.log('imgUrl chegando no removeFile:', imgUrl)
    var result = imgUrl.indexOf('img/defaultTodo.png') > -1
    if(result == false) {
        firebase.storage().refFromURL(imgUrl).delete().then(() => {
            console.log('Imagem deletada com sucesso!')
        }).catch((err) => {
            console.log(err)
        })
    } else {
        console.log('Não há imagens para deletar nesta tarefa.')
    }
}

// Prepara a interface para a atualização de tarefas:
var updateTodoKey = null
function updateTodo(key) {
    updateTodoKey = key     // Atribuí à uma variável de escopo global o valor da key 
    var todoName = document.querySelector(`#${key} > span`)
    todoFormTitle.innerHTML = `<strong>Adicionar tarefa: </strong>${todoName.innerHTML}`
    todoForm.name.value = todoName.innerHTML
    hideItem(submitTodoForm)
    showItem(cancelUpdateTodo)
}

// Faz a confirmação da atualização de tarefas
function confirmTodoUpdate() {
    var oldImgUrl = document.querySelector(`#${updateTodoKey} > img`)
    var newTodoName = todoForm.name.value
    var newTodoFile = todoForm.file.files[0]
    if(newTodoName != '') {
        if(newTodoFile != null) {
            if(newTodoFile.type.includes('image')) {
                
                if(newTodoFile.size > 1024 * 1024 * 2) {
                    alert(`A imagem não pode ser maior do que 2MB. A imagem selecionada tem ${(newTodoFile.size / 1024 / 1024).toFixed(2)}MB.`)
                    return  // Esse 'return' ignora o resto do código e sai do 'if'.
                }
                
                hideItem(cancelUpdateTodo)
                var imgName = firebase.database().ref().push().updateTodoKey + '-' + newTodoFile.name
                var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName
                var storageRef = firebase.storage().ref(imgPath)
                var upload = storageRef.put(newTodoFile)

                trackUpload(upload).then(() => {
                    storageRef.getDownloadURL().then((downloadUrl) => {
                        newData = {
                            imgUrl: downloadUrl,
                            name: newTodoName,
                            nameLowerCase: newTodoName.toLowerCase()
                        }

                        dbFirestoreUsers.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(updateTodoKey).update(newData).then(() => {
                            console.log('Tarefa atualizada com sucesso!')
                            removeFile(oldImgUrl.src)   // Remove a imagem antiga do storage
                            resetTodoForm()
                        }).catch((err) => {
                            console.log('Erro ao atualizar tarefa: ', err)
                        })

                        /* Código do Realtime DB: */
                        // dbRefUsers.child(firebase.auth().currentUser.uid).child(updateTodoKey).update(newData).then(() => {
                        //     console.log('Tarefa atualizada com sucesso!')
                        //     removeFile(oldImgUrl.src)   
                        //     resetTodoForm()
                        // }).catch((err) => {
                        //     console.log('Erro ao atualizar tarefa: ', err)
                        // })
                    })
                }).catch(() => {
                    alert('Falha ao atualizar tarefas')
                })
            } else {
                alert('O arquivo selecionado precisa ser uma imagem')
            }
        } else {    // Se nenhum arquivo de imagem foi selecionado:
            var newData = {
                name: newTodoName,
                nameLowerCase: newTodoName.toLowerCase()
            }

            dbFirestoreUsers.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(updateTodoKey).update(newData).then(() => {
                console.log('Tarefa atualizada com sucesso!')
                resetTodoForm()
            }).catch((err) => {
                console.log('Erro ao atualizar tarefa: ', err)
            })

            /* Código do Realtime DB: */
            // dbRefUsers.child(firebase.auth().currentUser.uid).child(updateTodoKey).update(newData).then(() => {
            //     console.log('Tarefa atualizada com sucesso!')
            //     resetTodoForm()
            // }).catch((err) => {
            //     console.log('Erro ao atualizar tarefa: ', err)
            // })
        }
    }
}

// Restaura o estado inicial do formulário de tarefas
function resetTodoForm() {
    todoForm.reset()
    todoFormTitle.innerHTML = 'Adicionar tarefa:'
    hideItem(cancelUpdateTodo)
    todoForm.submitTodoForm.style.display = 'initial'
}