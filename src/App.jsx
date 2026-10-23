
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'
import {
  signIn,
  signOut,
  completeSignIn,
  getCurrentUser,
  getAccessToken,
} from './auth'

const initialStories = [
  'Display milestone status',
  'Highlight delayed milestones',
  'Show project risks',
]

function App() {
  const [goal, setGoal] = useState(
    'Deliver a project dashboard showing milestone status and project risks'
  )
  const [duration, setDuration] = useState('2 weeks')
  const [capacity, setCapacity] = useState(20)
  const [stories, setStories] = useState(initialStories)
  const [newStory, setNewStory] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sprintPlan, setSprintPlan] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function initializeAuth() {
      try {
        const params = new URLSearchParams(window.location.search)
        const isCallback = params.has('code') && params.has('state')

        if (isCallback) {
          await completeSignIn()
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        const currentUser = await getCurrentUser()
        if (active) setUser(currentUser)
      } catch (error) {
        console.error('Authentication initialization failed:', error)
        if (active) {
          setMessage(
            'Sign-in could not be completed. Please try again. Check the browser console if the issue continues.'
          )
        }
      } finally {
        if (active) setAuthLoading(false)
      }
    }

    initializeAuth()

    return () => {
      active = false
    }
  }, [])

  async function handleSignIn() {
    try {
      setMessage('')
      await signIn()
    } catch (error) {
      console.error('Sign-in failed:', error)
      setMessage('Unable to start sign-in. Please check your Cognito configuration.')
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign-out failed:', error)
      setMessage('Unable to sign out. Please try again.')
    }
  }

  function addStory() {
    const value = newStory.trim()
    if (!value) return
    if (stories.length >= 50) {
      setMessage('A maximum of 50 candidate stories is allowed.')
      return
    }
    setStories([...stories, value])
    setNewStory('')
    setMessage('')
  }

  function removeStory(index) {
    setStories(stories.filter((_, i) => i !== index))
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (!user || user.expired) {
      setMessage('Please sign in before preparing a sprint plan.')
      return
    }

    if (!goal.trim()) {
      setMessage('Please enter a sprint goal.')
      return
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      setMessage('Team capacity must be a positive whole number.')
      return
    }

    if (stories.length === 0) {
      setMessage('Add at least one candidate story.')
      return
    }

    setLoading(true)
    setSprintPlan('')
    setMessage('Preparing your sprint plan...')

    try {
      const token = await getAccessToken()

      const response = await fetch(
        'https://4z32vuj7sf.execute-api.ap-southeast-2.amazonaws.com/plan-sprint',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sprint_goal: goal.trim(),
            sprint_duration: duration,
            team_capacity_points: Number(capacity),
            candidate_stories: stories,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Sprint planning API error:', response.status, data)

        if (response.status === 401 || response.status === 403) {
          setMessage(
            'Authentication failed. Please sign out and sign in again. If the issue continues, we will verify your Cognito token and API authorizer.'
          )
        } else {
          setMessage(
            data.message || `Sprint planning failed (HTTP ${response.status}).`
          )
        }
        return
      }

      if (data.status !== 'success' || !data.sprint_plan) {
        setMessage('The API responded, but no sprint plan was returned.')
        return
      }

      setSprintPlan(data.sprint_plan)
      setMessage('Sprint plan generated successfully. Please review it with your team.')
    } catch (error) {
      console.error('Sprint planning request failed:', error)

      if (error instanceof Error && error.message.toLowerCase().includes('token')) {
        setMessage('Your session may have expired. Please sign out and sign in again.')
      } else {
        setMessage(
          'Could not complete the sprint-planning request. Check the browser console for details.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const isSignedIn = Boolean(user && !user.expired)

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">S</span>
          <span>Agile<span className="brand-accent">Sprint AI</span></span>
        </a>
        <div className="topbar-right">
          <span className="environment"><span /> Portfolio demo</span>

          {authLoading ? (
            <span className="auth-status">Checking session…</span>
          ) : isSignedIn ? (
            <>
              <span className="auth-status">
                Signed in{user.profile?.email ? `: ${user.profile.email}` : ''}
              </span>
              <button
                className="signin-button"
                type="button"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="signin-button"
              type="button"
              onClick={handleSignIn}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <main className="main-content" id="home">
        <section className="hero">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            AI-ASSISTED DELIVERY PLANNING
          </div>
          <h1>Plan your next sprint<br /><span>with clarity.</span></h1>
          <p>
            Turn delivery goals into a structured sprint proposal.
            Prioritize stories, assess capacity, and surface risks before
            the team commits.
          </p>
          <div className="hero-points">
            <span>✓ Team capacity aware</span>
            <span>✓ Risk and dependency review</span>
            <span>✓ Human approval required</span>
          </div>
        </section>

        <div className="workspace">
          <section className="planner-card">
            <div className="card-heading">
              <div>
                <span className="section-kicker">SPRINT WORKSPACE</span>
                <h2>Define your sprint</h2>
                <p>Provide the details for your proposed sprint plan.</p>
              </div>
              <div className="step-indicator">01 <span>/ 02</span></div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="goal">Sprint goal</label>
                <textarea
                  id="goal"
                  rows="3"
                  maxLength="2000"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="What should the team deliver?"
                  required
                />
                <div className="field-hint">
                  <span>Describe the outcome you want to achieve.</span>
                  <span>{goal.length}/2000</span>
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="duration">Sprint duration</label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                  >
                    <option>1 week</option>
                    <option>2 weeks</option>
                    <option>3 weeks</option>
                    <option>4 weeks</option>
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="capacity">Team capacity</label>
                  <div className="capacity-input">
                    <input
                      id="capacity"
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      value={capacity}
                      onChange={(event) => setCapacity(event.target.value)}
                      required
                    />
                    <span>points</span>
                  </div>
                </div>
              </div>

              <div className="field-group stories-group">
                <div className="stories-heading">
                  <div>
                    <label>Candidate user stories</label>
                    <p>Add the work items the team may consider.</p>
                  </div>
                  <span className="story-count">{stories.length} stories</span>
                </div>

                <div className="story-list">
                  {stories.map((story, index) => (
                    <div className="story-item" key={`${story}-${index}`}>
                      <span className="story-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="story-text">{story}</span>
                      <button
                        className="remove-story"
                        type="button"
                        aria-label={`Remove ${story}`}
                        onClick={() => removeStory(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {stories.length === 0 && (
                    <p className="empty-stories">
                      No stories added yet. Add a candidate story below.
                    </p>
                  )}
                </div>

                <div className="add-story-row">
                  <input
                    aria-label="New candidate story"
                    value={newStory}
                    maxLength="500"
                    onChange={(event) => setNewStory(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addStory()
                      }
                    }}
                    placeholder="Add a candidate story..."
                  />
                  <button
                    className="add-button"
                    type="button"
                    onClick={addStory}
                    disabled={!newStory.trim() || stories.length >= 50}
                  >
                    + Add story
                  </button>
                </div>
              </div>

              {message && (
                <div className="status-message" role="status">
                  {message}
                </div>
              )}

              <button
                className="generate-button"
                type="submit"
                disabled={loading || authLoading || !isSignedIn}
              >
                {loading ? 'Preparing sprint plan…' : 'Prepare sprint plan'}{' '}
                <span>{loading ? '…' : '→'}</span>
              </button>
              <p className="approval-note">
                This proposal is not a team commitment. Final estimates and
                scope require Product Owner and delivery team approval.
              </p>
            </form>

            {sprintPlan && (
              <section className="sprint-plan-result" aria-live="polite">
                <div className="card-heading">
                  <div>
                    <span className="section-kicker">AI-GENERATED PROPOSAL</span>
                    <h2>Your sprint plan</h2>
                    <p>
                      Review the suggested scope and estimates with your delivery
                      team before committing.
                    </p>
                  </div>
                </div>
                <div className="sprint-plan-content">
                 <ReactMarkdown>{sprintPlan}</ReactMarkdown>
                </div>
                <p className="approval-note">
                  Team approval required. These estimates are preliminary
                  recommendations, not a commitment.
                </p>
              </section>
            )}
          </section>

          <aside className="side-column">
            <section className="summary-card">
              <span className="section-kicker">CURRENT INPUTS</span>
              <h3>At a glance</h3>
              <div className="metric">
                <div className="metric-icon purple">◷</div>
                <div><span>Sprint duration</span><strong>{duration}</strong></div>
              </div>
              <div className="metric">
                <div className="metric-icon blue">◎</div>
                <div><span>Team capacity</span><strong>{capacity || 0} story points</strong></div>
              </div>
              <div className="metric">
                <div className="metric-icon green">☷</div>
                <div><span>Candidate stories</span><strong>{stories.length} items</strong></div>
              </div>
              <div className="capacity-note">
                <strong>Capacity is a constraint</strong>
                <p>
                  The AI proposal should respect the available capacity.
                  Estimates are preliminary, not commitments.
                </p>
              </div>
            </section>

            <section className="process-card">
              <span className="section-kicker">PLANNING WORKFLOW</span>
              <h3>From goal to plan</h3>
              <div className="workflow-step">
                <span className="workflow-number active">1</span>
                <div><strong>Define the sprint</strong><p>Goal, capacity and candidate stories</p></div>
              </div>
              <div className="workflow-line" />
              <div className="workflow-step">
                <span className="workflow-number">2</span>
                <div><strong>Analyze and prioritize</strong><p>Stories, estimates, risks and dependencies</p></div>
              </div>
              <div className="workflow-line" />
              <div className="workflow-step">
                <span className="workflow-number">3</span>
                <div><strong>Team review</strong><p>Validate assumptions and approve scope</p></div>
              </div>
            </section>

            <div className="security-note">
              <span>▣</span>
              <p><strong>Human-in-the-loop</strong><br />AI recommendations support planning. The team makes the final decisions.</p>
            </div>
          </aside>
        </div>

        <footer className="footer">
          <span>AgileSprint AI · Portfolio project</span>
          <span>AI-assisted planning · Human-approved commitments</span>
        </footer>
      </main>
    </div>
  )
}

export default App
