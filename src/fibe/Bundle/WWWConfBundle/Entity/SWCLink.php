<?php

namespace fibe\Bundle\WWWConfBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * SWCLink
 *
 * @ORM\Table(name="SWCLink")
 * @ORM\Entity(repositoryClass="fibe\Bundle\WWWConfBundle\Entity\SWCLinkRepository")
 */
class SWCLink
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="confUri", type="string", length=255)
     */
    private $confUri;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set confUri
     *
     * @param string $confUri
     * @return SWCLink
     */
    public function setConfUri($confUri)
    {
        $this->confUri = $confUri;
    
        return $this;
    }

    /**
     * Get confUri
     *
     * @return string 
     */
    public function getConfUri()
    {
        return $this->confUri;
    }
}