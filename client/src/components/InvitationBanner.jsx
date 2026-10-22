import { useState } from 'react'
import { Users, Check, X } from './Icons.jsx'
import { useTeamStore } from '../store/useTeamStore.js'

export default function InvitationBanner() {
  const { invitations, joinTeamWithToken, declineInvitation } = useTeamStore()
  const [processingId, setProcessingId] = useState(null)
  const [feedback, setFeedback] = useState(null)

  if (!invitations || invitations.length === 0) {
    return null
  }

  const handleAccept = async (inv) => {
    try {
      setProcessingId(inv.id)
      setFeedback(null)
      await joinTeamWithToken(inv.team_id, inv.token)
      setFeedback(`Successfully joined ${inv.team_name}!`)
    } catch (err) {
      alert(err.message || 'Failed to join team')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (inv) => {
    try {
      setProcessingId(inv.id)
      await declineInvitation(inv.id)
    } catch (err) {
      alert(err.message || 'Failed to decline invitation')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-3.5 py-2.5 sm:px-6 sm:py-3 text-xs text-blue-950 transition-all">
      <div className="max-w-7xl mx-auto space-y-2">
        {feedback && (
          <div className="p-2 rounded bg-emerald-100 text-emerald-800 font-medium">
            {feedback}
          </div>
        )}

        {invitations.map((inv) => (
          <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-blue-100">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/30 mt-0.5 sm:mt-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 leading-snug">
                  You have been invited to join <span className="text-blue-700 font-bold">"{inv.team_name}"</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Invited by {inv.inviter_name || 'Team Owner'} • Recipient: {inv.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => handleAccept(inv)}
                disabled={processingId === inv.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{processingId === inv.id ? 'Joining...' : 'Accept & Join'}</span>
              </button>

              <button
                onClick={() => handleDecline(inv)}
                disabled={processingId === inv.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-600 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
