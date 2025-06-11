import React from 'react'
import { signIn } from 'next-auth/react'
import type { OAuthProviderType, OAuthProviderStyle } from '../types'
import { oauthProviderConfigs } from '../providers/oauth-configs'

export interface OAuthButtonProps {
  provider: OAuthProviderType
  callbackUrl?: string
  className?: string
  style?: OAuthProviderStyle
  children?: React.ReactNode
}

/**
 * OAuth provider sign-in button component
 */
export function OAuthButton({ 
  provider, 
  callbackUrl = '/',
  className = '',
  style: customStyle,
  children
}: OAuthButtonProps) {
  const providerConfig = oauthProviderConfigs[provider]
  if (!providerConfig) return null
  
  const style = customStyle || providerConfig.style
  
  const handleSignIn = () => {
    signIn(provider, { callbackUrl })
  }
  
  return (
    <button
      onClick={handleSignIn}
      className={`oauth-button oauth-button-${provider} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '0.375rem',
        border: '1px solid transparent',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: style?.bg || '#f3f4f6',
        color: style?.text || '#111827',
        ...getProviderStyles(provider)
      }}
    >
      {style?.logo && (
        <img 
          src={style.logo} 
          alt={providerConfig.name} 
          width={20} 
          height={20}
          style={{ display: 'block' }}
        />
      )}
      {children || `Continue with ${providerConfig.name}`}
    </button>
  )
}

/**
 * Get provider-specific styles
 */
function getProviderStyles(provider: OAuthProviderType): React.CSSProperties {
  switch (provider) {
    case 'google':
      return {
        backgroundColor: '#fff',
        color: '#3c4043',
        border: '1px solid #dadce0',
        '&:hover': {
          backgroundColor: '#f8f9fa'
        }
      }
    case 'facebook':
      return {
        backgroundColor: '#1877f2',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#166fe5'
        }
      }
    case 'github':
      return {
        backgroundColor: '#24292e',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#1a1e22'
        }
      }
    case 'kakao':
      return {
        backgroundColor: '#fee500',
        color: '#000',
        '&:hover': {
          backgroundColor: '#fdd835'
        }
      }
    case 'naver':
      return {
        backgroundColor: '#03c75a',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#02b350'
        }
      }
    default:
      return {}
  }
}