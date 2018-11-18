import { warn } from '../utils/utils'


// private global state for the queue feature
let currentSteps = []

/*
 * Global function for chaining sweetAlert popups
 */
export const queue = function (steps) {
  const swal = this
  currentSteps = steps
  const resetQueue = () => {
    currentSteps = []
    document.body.removeAttribute('data-swal2-queue-step')
  }
  let queueResult = []
  return new Promise((resolve) => {
    (function step (i, callback) {
      if (i < currentSteps.length) {
        document.body.setAttribute('data-swal2-queue-step', i)
        document.body.setAttribute('data-swal2-queue-step-back-enabled', currentSteps[i].enableBack)
        if (currentSteps[i].enableBack) {
          if (i === 0) {
            warn('You cannot enable back on first element')
          }  else {
            currentSteps[i].showCancelButton = true
            // currentSteps[i].reverseButtons = true
            currentSteps[i].cancelButtonText = '&larr; Back'
          }
          if (i < queueResult.length ) {
            // We've been here already ;-) 
            currentSteps[i].inputValue = queueResult.pop()
          }
        }
        swal(currentSteps[i]).then((result) => {
          if (typeof result.value !== 'undefined') {
            queueResult.push(result.value)
            step(i + 1, callback)
          } else if (result.dismiss && document.body.getAttribute('data-swal2-queue-step-back-enabled')) {
            step(i - 1, callback)
          } else {
            resetQueue()
            resolve({ dismiss: result.dismiss })
          }
        })
      } else {
        resetQueue()
        resolve({ value: queueResult })
      }
    })(0)
  })
}

/*
 * Global function for getting the index of current popup in queue
 */
export const getQueueStep = () => document.body.getAttribute('data-swal2-queue-step')

/*
 * Global function for inserting a popup to the queue
 */
export const insertQueueStep = (step, index) => {
  if (index && index < currentSteps.length) {
    return currentSteps.splice(index, 0, step)
  }
  return currentSteps.push(step)
}

/*
 * Global function for deleting a popup from the queue
 */
export const deleteQueueStep = (index) => {
  if (typeof currentSteps[index] !== 'undefined') {
    currentSteps.splice(index, 1)
  }
}
