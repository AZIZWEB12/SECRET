import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(to bottom right, #8A2BE2, #9370DB, #6A5ACD)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bolder',
          borderRadius: '6px',
          fontFamily: '"PT Sans", sans-serif'
        }}
      >
        SDC
      </div>
    ),
    {
      ...size,
    }
  )
}
