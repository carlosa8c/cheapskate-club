'use client';
import {useState} from 'react';
export function ShareActions({handle,url}:{handle:string;url:string}){
 const [message,setMessage]=useState('');
 return <section className="share-card-actions" aria-label="Share profile"><div><p className="eyebrow">A LITTLE WELL-EARNED BRAGGING</p><h2>Share your cheapo card.</h2></div><div className="share-buttons"><a className="button primary" href={`/api/cards/${handle}?download=1`} download>Download PNG ↓</a><a className="button" href={`https://twitter.com/intent/tweet?${new URLSearchParams({text:'Less bill. More brag. My zero-cost token tally at The Cheapskate Club:',url})}`} target="_blank" rel="noopener noreferrer">Share on X ↗</a><button className="button" onClick={async()=>{try{await navigator.clipboard.writeText(url);setMessage('Profile link copied.');}catch{setMessage(`Copy this link: ${url}`);}}}>Copy link</button></div><p className="share-help">Share on X opens a draft with your profile link. You can attach the downloaded card before posting.</p><p role="status">{message}</p></section>;
}
