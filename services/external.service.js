module.exports = {
    execute
}

const errors = [
    'I dont feel like it',
    'High temperature',
    'Don\'t disturb me in the middle of my מילקי',
    'Attempted to take a key from Havitush without permission from Rega and Dodly',
    'You can\'t handle the truth!',
    'ככה לא בונים חומה',
    'Shu bidak',

]

function execute(task) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.5) resolve(parseInt(Math.random() * 100))
            reject(_getRandomError());
        }, 5000)
    })
}

function _getRandomError() {
    return errors[Math.floor(Math.random() * errors.length)]
}