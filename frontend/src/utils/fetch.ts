import qs from 'qs'

const customFetch = async (url: string, query?: object) => {
  const queryString = qs.stringify(query)
  const _url = `${url}?${queryString}`
  let response
  try {
    response = await fetch(_url)
  } catch (error) {
    console.debug('Failed to fetch', error)
    throw new Error(`Failed to fetch`)
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch `)
  }
  const json = await response.json()
  return json
}

export default customFetch
