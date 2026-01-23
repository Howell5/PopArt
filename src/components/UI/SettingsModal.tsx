import { useState, useEffect } from 'react'
import { Gear, X } from '@phosphor-icons/react'
import { getNebulaApiKey, setNebulaApiKey } from '../../utils/apiKeyStorage'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  // Load existing key when modal opens
  useEffect(() => {
    if (isOpen) {
      const existingKey = getNebulaApiKey()
      setApiKey(existingKey || '')
      setError('')
    }
  }, [isOpen])

  const handleSave = () => {
    const trimmedKey = apiKey.trim()

    if (!trimmedKey) {
      setError('请输入 API Key')
      return
    }

    setNebulaApiKey(trimmedKey)
    setError('')
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Gear size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">设置 API Key</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nebula API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <p className="text-xs text-gray-500">
            API Key 将保存在本地浏览器中，不会上传到服务器。
            <br />
            如不知道去哪获取 API Key，请找 @方旌。
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
