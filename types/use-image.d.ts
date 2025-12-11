declare module "use-image" {
  type ImageStatus = "loading" | "loaded" | "failed"
  
  function useImage(
    url: string,
    crossOrigin?: "anonymous" | "use-credentials" | "" | undefined
  ): [HTMLImageElement | undefined, ImageStatus]
  
  export default useImage
}
