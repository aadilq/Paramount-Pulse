import re

REVIEW_KEYWORDS = [
    "review",
    "reviews",
    "reviewed",
    "reaction",
    "reactions",
    "critic",
    "critics",
    "verdict",
    "recap",
]


def _normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9 ]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def build_review_query(release: str) -> str:
    """Exact release title AND'd against review-signal terms (NewsAPI boolean query syntax)."""
    keyword_clause = " OR ".join(REVIEW_KEYWORDS)
    return f'"{release}" AND ({keyword_clause})'


def release_in_title(release: str, title: str) -> bool:
    """True if the release is actually the subject of the headline, not just named in passing."""
    return _normalize(release) in _normalize(title)


def is_relevant_review(release: str, title: str, text: str) -> bool:
    """True only if the headline is actually about the release AND the piece reads as a review.

    Requiring the release name in the title (not just anywhere in the body) rules out
    articles/videos that only name-drop the release in passing. Requiring review-language
    in the text we actually have on hand (title+description, or title+description+content
    for NewsAPI) rules out unrelated coverage - trailers, merch, casting news - that a
    source's boolean search query alone can't filter out, since NewsAPI's `q` match runs
    against the full server-side article text, which can contain a keyword in a completely
    unrelated context (e.g. discussing "mixed reactions" to a past adaptation).
    """
    haystack = _normalize(f"{title} {text}")
    has_review_language = any(keyword in haystack for keyword in REVIEW_KEYWORDS)
    return release_in_title(release, title) and has_review_language
