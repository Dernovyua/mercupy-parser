import asyncio
import os
import time
from functools import reduce
from typing import List, Tuple, Union, Optional
from urllib.parse import urljoin as join

import httpx
from httpx import Response
import requests
import json


def urljoin(*terms: str) -> str:
    """ Correctly adds terms to a url."""
    return reduce(join, terms)


class Mercupy:
    def __init__(self,
                 api_endpoint: Optional[str] = None,
                 verbose: bool = False) -> None:
        api_endpoint = api_endpoint or os.environ.get("API_ENDPOINT", "http://0.0.0.0:4000")
        self.api_endpoint = urljoin(api_endpoint, "parser")
        self.verbose = verbose
    
    
    def parse_prefetched(self, html: str, url: Optional[str], custom_extractor: Optional[dict]):
        """
        Send a pre-fetched HTML document to Mercury Parser. Sync-only at the moment.

        Parameters
        ----------
        html : str
            HTML document to parse. Converted to UTF-8 before sending.
        url : Optional[str]
            Optional URL where the document was fetched.
            If None, Mercury will pull URL from the 'canonical' tag in the HTML.
            Should that fail, URL will be set to 'http://example.com/'
        custom_extractor: Optional[dict]
            Optional custom extractor to provide Mercury with.
            See Mercury Parser source for examples.
            Note that 'full' extractors are not required.
            I.e. you may override 'title' with a selector,
            and leave other fields unspecified.
            Mercury will use the override for the title
            and infer the rest using its default heuristics.

        Returns
        -------
        requests.Response
            Response from the Mercury API, hopefully with the parsed article.
            Take note that the fields will be HTML-escaped.
            Postprocess with html.unescape() for an as-is representation.

        """
        headers = {'Content-Type': 'text/html'}
        
        if url:
            headers['URL'] = url
            
        if custom_extractor:
            headers['Custom-Extractor'] = json.dumps(custom_extractor).encode('utf-8')
        
        
        return requests.post(
                self.api_endpoint,
                headers=headers,
                data=html.encode('utf-8')
            ).json()

    def parser(self,
               urls: Union[str, List[str]],
               headers: Optional[str] = None,
               content_type: Optional[str] = None) -> Tuple[Response]:
        """ Gathers responses from async requests to mercury parser """
        if not urls:
            raise AttributeError("URLS not provided")

        if isinstance(urls, str):
            urls = [urls]

        responses = asyncio.run(self._parser(urls, headers, content_type))
        return responses

    async def _parser(self,
                      urls: List[str],
                      headers: Optional[str] = None,
                      content_type: Optional[str] = None,
                      timeout: int = 20) -> Tuple[Response]:
        """ Convenience method to parse multiple urls """
        params = {"headers": headers, "contentType": content_type}
        # Keep only values that are not None
        params = {key: value for key, value in params.items() if value}

        start = time.perf_counter()

        async with httpx.AsyncClient() as client:
            tasks = (client.get(self.api_endpoint,
                                params={"url": url, **params},
                                timeout=timeout)
                     for url in urls)
            responses = await asyncio.gather(*tasks)

        end = time.perf_counter()
        if self.verbose is True:
            print(f"Response time: {end - start:.2f} sec")

        return responses

