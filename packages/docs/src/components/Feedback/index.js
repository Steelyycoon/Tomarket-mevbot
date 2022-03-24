import React, { useState } from 'react'
import { useLocation } from '@docusaurus/router'
import { trackEvent, events } from '../../util/countly'

function Feedback ({ strings: { title, yes, no, thanks, helpUsImprove }, children }) {
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  const location = useLocation()

  const sendFeedback = (answer, answerText) => {
    trackEvent(events.FEEDBACK_HELPFUL, {
      path: location.pathname,
      question: title,
      answer,
      answerText
    })
    setVoteSubmitted(true)
  }

  const actions = (
    <div>
      <button
        onClick={() => sendFeedback('yes', yes)}
      >
        {yes}
      </button>
      <button
        onClick={() => sendFeedback('no', no)}
      >
        {no}
      </button>
    </div>
  )

  const thanksView = (
    <div className='feedback-result'>
      {thanks}
    </div>
  )
  return (
    <div>
      <h3>{title}</h3>
      {voteSubmitted ? thanksView : actions}
      <h4>{helpUsImprove}</h4>
      {children}
    </div>
  )
}

Feedback.defaultProps = {
  strings: {
    title: 'Was this information helpful?',
    yes: 'Yes',
    no: 'No',
    thanks: 'Thanks! We will use your feedback to prioritize future work.',
    helpUsImprove: 'Help us improve this site!'
  }
}

export default Feedback
