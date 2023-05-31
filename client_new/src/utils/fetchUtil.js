export const SERVER_URL = "http://127.0.0.1:5000";

export async function handleResponse(response) {
  if (!response.ok) {
    let errorResponse = await response.json();
    if (Array.isArray(errorResponse.errors)) {
      errorResponse = errorResponse.errors.map((err) => err.msg).join(", ");
    }
    throw new Error(errorResponse.error || errorResponse);
  }
  return await response.json();
}
